var stockfish = require("stockfish/src/stockfish.js");
var engine    = stockfish();

var position = "fen rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2"




var got_uci;
var started_thinking;


/*
// 
var EvaluateBoard = function(FEN_format_position,evaluation_time_length) {
    // メンバ変数 (インスタンス変数)
    this.name = name;
    this.age  = age;
}
*/

function send(str)
{
    console.log("Sending: " + str)
    engine.postMessage(str);
}

engine.onmessage = function(line) {

    console.log(line);

    /*
    if(line.indexOf("Space")>-1)
    {
    	line = line.trimLeft();
    	console.log("Space place:"+line.indexOf("Space"));
    	console.log("Space length:"+line.length);
    	moziretu = line.split(" ");
    	console.log(moziretu[0]);
    	console.log(moziretu[1]);
    	console.log(moziretu[2]);
    	console.log(moziretu[3]);
    }
    */

    if (!got_uci && line === "uciok") {
        got_uci = true;
        if (position) {
            send("position " + position);
            send("eval");
            send("d");
        }
        
        //send("go ponder");
    }
    else if (!started_thinking && line.indexOf("info depth") > -1) {
        console.log("Thinking...");
        started_thinking = true;
        setTimeout(function ()
        {
            send("stop");
        }, 1000 * 2);
    } else if (line.indexOf("bestmove") > -1) {
        match = line.match(/bestmove\s+(\S+)/);
        if (match) {
            console.log("Best move: " + match[1]);
            process.exit();
        }
    }
};

engine.postMessage("uci");