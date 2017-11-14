
var stockfish = require("stockfish/src/stockfish.js");


var EvaluateBoard = function(FEN_format_position,evaluation_time_length) {

    // 結果を格納するメンバー変数
    var self        = this;
    this.best_move  = "";

    /* チェスエンジンを起動する */
    this.engine    = stockfish();
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
        // 候補手探索が打ち切られると通知される最善手に対する処理
        else if (line.indexOf("bestmove") > -1) {
            match = line.match(/bestmove\s+(\S+)/);
            if (match) {
                //console.log("Best move: " + match[1]);
                self.best_move = match[1];
                process.exit();
            }
        }
    };

}

var position = "fen rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2";
var evaluator = new EvaluateBoard(position,2);