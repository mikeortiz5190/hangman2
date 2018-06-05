$(document).ready(function(){



//myWords = ["engine", "animal", "whiskey", "purple", "everest", "fahrenheight"];

//TO KEEP TRACK OF WINS/LOSSES

var playerName = "";

var theWord="";

var splitWord=[];

var lettersLeft=0;

var guessesLeft=0;

var hiddenWord=[];

var wrongGuesses = [];

//var linkOne = "wordMaker.html"
   
//var linkTwo = "wordGuesser.html"



  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyDJI4IdvusuGLF12vCxMybonVNsNMRatIQ",
    authDomain: "hangman-1062a.firebaseapp.com",
    databaseURL: "https://hangman-1062a.firebaseio.com",
    projectId: "hangman-1062a",
    storageBucket: "hangman-1062a.appspot.com",
    messagingSenderId: "465684023841"
  };

  firebase.initializeApp(config);

  var database = firebase.database();

  window.onload = function(){
    $(".keyboard").hide();
    alert("it works!");
};


//CLICK START, A NEW WORD IS RNDAOMLY SELECTED

$("#start-here").on('click', function(){
    $("#myModal").modal("show");
    $("#start-here").hide();
});


$("#add-name").on('click', function(){
    $("#myModal").modal("hide");
    playerName = $("#name-input").val().trim();
    console.log(playerName);
    checkPlayerNames(playerName);
    return playerName;
});

//ADDING NAME TO FIREBASE

// check player names

function checkPlayerNames(playerName){
    database.ref("players").once("value", function(snapshot){
        var p1=snapshot.child("word_maker").exists();
        var p2=snapshot.child("word_guesser").exists();
        if(p1==false && p2==false){
            $("#myModal2").modal("show");
        }
        else if(p1==true && p2==false){
            database.ref("/players/word_guesser").update({
                Name: playerName
            });
            $("#myModal3").modal("show");
            //$("#continue").html("<a href=" + linkOne + "><button>Continue</button></a>");
            $(".jumbotron").show();
            $("#word-form").hide();
            return playerName;
        }
        else if(p1==false && p2==true){
            database.ref("/players/word_maker").update({
                Name: playerName
            });
            $("#myModal3").modal("show");
            //$("#continue").html("<a href=" + linkTwo + "><button>Continue</button></a>");
            $(".jumbotron").show();
            return playerName;
        }
    });
};

//MODEL 2 **********

$("#word-maker").on('click', function(){
    $("#myModal2").modal("hide");
    database.ref("/players/word_maker").set({
        Name: playerName
    });
    $(".jumbotron").show();
    $("#keyboard").hide();
    return playerName;
});   

$("#word-guesser").on('click', function(){
    $("#myModal2").modal("hide");
    database.ref("/players/word_guesser").set({
        Name: playerName
    }) ;
    $(".jumbotron").show();
    $("#keyboard").show();
    $("#word-form").hide();
    return playerName;
});

//Modal 3***********

$("#continue").on('click', function(){
    $("#myModal3").modal("hide");
});





//THE WORD IS SUBMIITED BY PLAYER 1 AND PLACED IN THE DATABASE AND SPLIT INTO AN ARRAY
$("#add-word").on('click', function(){
    $("#word-form").hide();
    theWord = $("#word-input").val().trim();
    $("#the-chosen-word-only-player-1-sees").html("<h3>"+ theWord + "</h3>");
    splitWord = theWord.split("");
    console.log(splitWord);
    console.log(splitWord.length);
    lettersLeft = splitWord.length;
    console.log(lettersLeft);
    guessesLeft=lettersLeft+5;

    //UNDERSCORE SPLICING
    for ( var i = 0; i < splitWord.length; i++) {
        hiddenWord.push("_"); 
    };
    console.log(hiddenWord);
    //$("#theWord").html("<p>" + hiddenWord + "<p>"); triggers event function below for firebase
    //*********/

    database.ref("/players/word_maker").update({
        The_word:theWord,
        The_splitted_word:splitWord
    });
    database.ref("/players/word_guesser").update({
        wrong_guesses: wrongGuesses,
        letters_left:lettersLeft,
        guesses_left: guessesLeft,
        hidden_word: hiddenWord
    });
    $("#guesses-remaining").html( "<p>" + guessesLeft + "</p>" );
    return splitWord, lettersLeft, guessesLeft, theWord, hiddenWord, wrongGuesses;
});








//ANY LETTER THAT IS CLICKED WILL RUN THROUGH A FUNCTION WITH A FOR LOOP THAT WILL VERIFY IF THE CHOSEN LTTER MATCHES EACH THE GUESSING WORD AT THE CURRENT ITERATION.

$(".aButton").on('click', function(){
    console.log(this);
    var letter = this.value;
    console.log(letter);
    var countDown = splitWord.length;
    var go_nogo = false;
    database.ref("/players").once("value", function(snapshot){
    splitWord = snapshot.val().word_maker.The_splitted_word;
    hiddenWord = snapshot.val().word_guesser.hidden_word;
    lettersLeft = snapshot.val().word_guesser.letters_left;
    guessesLeft = snapshot.val().word_guesser.guesses_left;

    for (var i = 0; i < splitWord.length; i++){
        //console.log(splitWord[i]);
        if(letter === splitWord[i]){
            countDown = countDown-1;
            go_nogo = true;
            hiddenWord[i] = letter;
            lettersLeft--;
            console.log(lettersLeft);
            database.ref("/players/word_guesser").update({
                hidden_word: hiddenWord,
                letters_left: lettersLeft
            });
            //$("#theWord").html("<p>" + hiddenWord + "<p>");  ->now done instead below
            if(lettersLeft === 0){
                Winner();
                break;
            }
        }

        else{
            countDown = countDown-1;
            if (countDown === 0 && go_nogo == false){
                //$("#guesses").append(letter); --> now done belorw instead
                guessesLeft--;
                wrongGuesses.push(letter)
                database.ref("/players/word_guesser").update({
                    wrong_guesses: wrongGuesses,
                    guesses_left: guessesLeft
                });
                
                if(guessesLeft === 0){
                    GameOver();
                }
                else{
                    console.log( "you have "+ guessesLeft + " guesses left");
                    //$("#guesses-remaining").html( "<p>" + guessesLeft + "</p>" ); --> now done belorw instead
                }   
            }
            else if (countDown === 0 && go_nogo == true){
                break;   
            }

        }

    };
})
    $(this).hide();
    return splitWord, hiddenWord, lettersLeft, guessesLeft, wrongGuesses;
});

function GameOver(){
 console.log("u loose");
};

function Winner(){
    $("#keyboard").html( "<p>YOU WIN!!!</p>" );
};


//REAL TIME UPDATES

database.ref("/players/word_guesser").on("value", function(snapshot){
    var aa=snapshot.child("hidden_word").exists();
    if(aa){
        var a = snapshot.val().hidden_word;
        console.log(a);
        $("#theWord").html("<p> " + a + " <p>");
    }
    else{
        $("#theWord").html("<p><p>");
    }
});

database.ref("/players/word_guesser").on("value", function(snapshot){
    var bb=snapshot.child("guesses_left").exists();
    if(bb){
        var b = snapshot.val().guesses_left;
        console.log(b);
        $("#guesses-remaining").html("<p> " + b + " <p>");
    }
    else{
        $("#guesses-remaining").html("<p><p>");
    }
});

database.ref("/players/word_guesser").on("value", function(snapshot){
    var cc=snapshot.child("wrong_guesses").exists();
    if(cc){
        var c = snapshot.val().wrong_guesses;
        console.log(c);
        $("#wrong_guesses").html("<p> " + c + " <p>");
    }
    else{
        $("#wrong_guesses").html("<p><p>");
    }
});




})