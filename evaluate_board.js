var stockfish = require("stockfish/src/stockfish.js");

/* 評価値配列のindex定数 */
var WHITE_EVAL_SCORE = 0;
var BLACK_EVAL_SCORE = 1;
var TOTAL_EVAL_SCORE = 2;

/* FEN形式のポジションと解析時間を入力として、解析を行うクラス。
　解析が終わるとis_finish_evaluationがtrueになり、解析結果がメンバー変数に格納される */
var EvaluateBoard = function(FEN_format_position,evaluation_time_length)
{
    var self    = this;
    this.engine = stockfish();

    /* 解析結果を格納するメンバー変数 */
    this.best_move              = "";               // 最善手
    this.calculated_line        = "";               // エンジンが読んだ筋
    this.total_evaluation_score = 0;                // 現在の局面の評価値。単位はCP
    /* 評価値の内訳[White,Black,Total] 単位はCP(100CP=1Pawn)
    　詳細はstockfishのサイトを参照　→　https://hxim.github.io/Stockfish-Evaluation-Guide/　*/
    this.material               = [null,null,0];    // コマ数による評価
    this.imbalance              = [null,null,0];    // NvsB、ポーン形、QvsR+Bとかの差を考慮した評価
    this.pawn                   = [null,null,0];    // 孤立ポーン、バックワードポーン、ダブルポーン、コネクテッドポーンとかを加味したポーンの評価
    this.knight                 = [0,0,0];          // アウトポストに行けるかとかを考慮したナイトの評価
    this.bishop                 = [0,0,0];          // 同色にあるポーンの数とかを考慮したビショップの評価
    this.rook                   = [0,0,0];          // オープンファイルとかを考慮したルークの評価
    this.queen                  = [0,0,0];          // ピンされてるとかを考慮したクイーンの評価
    this.mobility               = [0,0,0];          // 駒の効きを考慮したピースの評価
    this.king_safety            = [0,0,0];          // キングの安全性の評価
    this.threats                = [0,0,0];          // 駒が取られそうかどうかに関する評価
    this.passed_pawn            = [0,0,0];          // ブロックされてるかとかを考慮したパスポーンのボーナス
    this.space                  = [0,0,0];          // 自分が支配しているエリアの広さ

    /* チェスエンジンを起動する */
    this.is_finish_evaluation = false;
    this.engine.postMessage("uci");

    /////////////* ここまでコンストラクタ *////////////////    
    /* 処理のメイン部分　エンジンから送られてくるメッセージを解析して処理する */
    this.engine.onmessage = function(line) {
    
        this.send = function(str){
            console.log("Sending: " + str)
            this.postMessage(str);
        };

        console.log(line);
        
        // チェスエンジンの準備ができた通知が来たときの処理
        if (line === "uciok") 
        {
            this.send("position " + FEN_format_position);   // ポジションの設定
            this.send("eval");                              // 局面評価開始
            this.send("d");                                 // 盤面をAA表示
            this.send("go ponder");                         // 候補手探索開始

            var f = this;
            setTimeout( function (){f.send("stop");} , 1000 * evaluation_time_length); // 何秒後に候補手探索を打ち切るかを設定
        }
        else if(line.indexOf("Total Evaluation:") > -1){
            match = line.match(/Total Evaluation:\s+(\S+)/);
            if(match){ self.total_evaluation_score = match[1]; }
        }
        // 候補手探索が打ち切られると通知される最善手に対する処理
        else if (line.indexOf("bestmove") > -1) {
            match = line.match(/bestmoveSan\s+(\S+)/);
            if (match) { self.best_move = match[1]; }
            self.is_finish_evaluation = true;
        }
    };

    this.executeCallbackfuncAfterEvaluationFinish = function(callback_func){
        if( this.is_finish_evaluation == true )
        {
            callback_func();
            return; 
        }
        setTimeout(function(){ self.executeCallbackfuncAfterEvaluationFinish(callback_func); }, 500);
    };

}


/* 局面評価クラスの使用方法のイメージ　*/
var position = "fen rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2";
var evaluator = new EvaluateBoard(position,2);
evaluator.executeCallbackfuncAfterEvaluationFinish( function(){
    console.log("\n\nEvaluation Finsh.\nPsition Evaluation Score is " + evaluator.total_evaluation_score + "\nBest move is " + evaluator.best_move);
});
