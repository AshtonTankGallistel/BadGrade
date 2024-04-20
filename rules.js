
var pens = [];
var removedPen = "null"
var pensStolen = 0;
var fire = false;
var machineState = 0;
var test = "your Test";

class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title); // TODO: replace this text using this.engine.storyData to find the story title
        this.engine.addChoice("Begin the story");
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation); // TODO: replace this text by the initial location of the story
    }
}

class Location extends Scene {
    create(key) {

        if(key == "Intro"){
            //this.engine.show("Resetting variables");
            pens = [];
            removedPen = "null"
            pensStolen = 0;
            fire = false;
            machineState = 0;
            test = "your Test";
        }

        //this.engine.show(pens);
        let locationData = this.engine.storyData.Locations[key]; // TODO: use `key` to get the data object for the current story location

        if(locationData.TestStatus){
            test = locationData.TestStatus;
        }

        if(fire && locationData.BodyFire){
            this.engine.show(locationData.BodyFire);
        }else if(!locationData.ChoicesPen || pensStolen < 3)
            this.engine.show(locationData.Body); // TODO: replace this text by the Body of the location data
        else
            this.engine.show(locationData.Body2);

        if(locationData.ChoicesPen && pensStolen < 3) {
            //this.engine.show("entering choice pen thingamabob");
            for(let choice of locationData.ChoicesPen) { 
                //this.engine.show(choice.Text in pens);
                if(!(choice.Text in pens)){ //check currently doesnt work
                    //this.engine.show("attempting choice addition");
                    this.engine.addChoice(choice.Text,choice);
                }
            }
        }
        if(fire && locationData.ChoicesFire){
            for(let choice of locationData.ChoicesFire) { 
                this.engine.addChoice(choice.Text,choice);
            }
        }else if(locationData.Choices) { // TODO: check if the location has any Choices
            for(let choice of locationData.Choices) { // *DONE*TODO: loop over the location's Choices
                this.engine.addChoice(choice.Text,choice); // *DONE*TODO: use the Text of the choice
                // *DONE*TODO: add a useful second argument to addChoice so that the current code of handleChoice below works
            }
        } else {
            this.engine.addChoice("The end.")
        }
    }

    handleChoice(choice) {
        if(choice.isPen == "true"){
            //this.engine.show("adding pen to list");
            pens.push(choice.Text);
            pensStolen += 1;
        }
        if(choice) {
            this.engine.show("&gt; "+choice.Text);
            if(choice.Target == "Science Classroom")
                this.engine.gotoScene(Machine, choice.Target);
            else if(choice.Target == "Home")
                this.engine.gotoScene(Home, choice.Target);
            else
                this.engine.gotoScene(Location, choice.Target);
        } else {
            this.engine.gotoScene(End);
        }
    }
}

//pen machine controller
class Machine extends Scene {
    create(key) {
        let locationData = this.engine.storyData.Locations[key]; // TODO: use `key` to get the data object for the current story location
        
        //test depends on state of fire and machine state
        if(fire && locationData.BodyFire)
            this.engine.show(locationData.BodyFire);
        else{
            this.engine.show(locationData.Body);
            if(locationData.Display){
                switch(machineState){
                    case 0:
                        this.engine.show(locationData.Display);
                        break;
                    case 1:
                        this.engine.show(locationData.Display1);
                        break;
                    case 2:
                        this.engine.show(locationData.Display2);
                        break;
                    default:
                        break;
                }
            }
        }
        
        if(locationData.Choices) {
            for(let choice of locationData.Choices) {
                this.engine.addChoice(choice.Text,choice);
            }
            //this.engine.show(pens + "," + pens.length);
            for(let i = 0; i < pens.length; i++){
                //this.engine.show("adding pen to list " + pens[i]);
                locationData["PenChoice" + (i+1)].Text = "Insert " + pens[i] + " pen";
                locationData["PenChoice" + (i+1)].PenColor = pens[i];
                this.engine.addChoice(locationData["PenChoice" + (i+1)].Text,locationData["PenChoice" + (i+1)]);
            }
        } else {
            this.engine.addChoice("The end.")
        }
    }

    handleChoice(choice) {
        if(choice.Target == "Game Over"){
            this.engine.show("&gt; "+choice.Text);
            this.engine.gotoScene(End);
        }
        else if(choice.PenColor){
            this.engine.show("&gt; "+choice.Text);
            //this.engine.show(choice.PenColor + "," +(choice.PenColor == "Green"));
            //removedPen = choice.PenColor;
            //pens.filter(diffColor);
            for(let i = 0; i < pens.length; i++){
                if(pens[i] == choice.PenColor){
                    //this.engine.show(pens[i]);
                    pens.splice(i,1);
                    i = pens.length + 1;
                }
            }
            //this.engine.show("list:" + pens);
            if(machineState == 0 && choice.PenColor == "Green"){
                machineState += 1;
                this.engine.show(choice.PenInsertedRight);
                this.engine.gotoScene(Machine, choice.Target);
            }
            else if(machineState == 1 && choice.PenColor == "Yellow"){
                machineState += 1;
                this.engine.show(choice.PenInsertedRight);
                this.engine.gotoScene(Machine, choice.Target);
            }
            else if(machineState == 2 && choice.PenColor == "Blue"){
                //Results in true ending
                this.engine.gotoScene(Machine, choice.TargetWin);
            }
            else{
                if(fire == false){
                    fire = true;
                    this.engine.show(choice.PenInsertedWrong);
                    this.engine.gotoScene(Machine, choice.Target);
                }
                else{
                    this.engine.show(choice.PenInsertedDoom);
                    this.engine.gotoScene(Location, choice.TargetDoom);
                }
            }
        }
        else if(choice) {
            this.engine.show("&gt; "+choice.Text);
            if(choice.Target == "Classroom")
                this.engine.gotoScene(Location, choice.Target);
            else
                this.engine.gotoScene(Machine, choice.Target);
        } else {
            this.engine.gotoScene(End);
        }
    }
}

//Below function was an attempt to more easily remove specific colors from an array alongside filter. it didnt work i think
/*
function diffColor(b){
    this.engine.show(removedPen + "!=" + b + " is " + (removedPen != b));
    return removedPen != b;
}
*/
class Home extends Scene {
    create(key) {
        //this.engine.show("list:" + pens);
        let locationData = this.engine.storyData.Locations[key]; // TODO: use `key` to get the data object for the current story location
        this.engine.show(locationData.Body); // TODO: replace this text by the Body of the location data
        
        if(key == "Forgery fail"){
            //this.engine.show("list:" + pens + "," + "Red" in pens);
            if(pens.includes("Red"))
                this.engine.show(locationData.BodyRedY);
            else
                this.engine.show(locationData.BodyRedN);
            if(pens.includes("White"))
                this.engine.show(locationData.BodyWhiteY);
            else
                this.engine.show(locationData.BodyWhiteN);
            if(pens.includes("Black"))
                this.engine.show(locationData.BodyBlackY);
            else
                this.engine.show(locationData.BodyBlackN);
        }

        if(locationData.TestStatus){
            test = locationData.TestStatus;
        }

        if(locationData.Choices) { // TODO: check if the location has any Choices
            //this.engine.show(test);
            for(let choice of locationData.Choices) { // *DONE*TODO: loop over the location's Choices
                if(!choice.Requirement)
                    this.engine.addChoice(choice.Text,choice);
                else if(choice.Requirement == "pen" && pens.length > 0)
                    this.engine.addChoice(choice.Text,choice);
                else if(choice.Requirement == "Correct pens" && pens.includes("Red") && pens.includes("Black") && pens.includes("White")){
                    this.engine.addChoice(choice.Text,choice);
                }
                else if(choice.Requirement == "Incorrect pens" && (!pens.includes("Red") || !pens.includes("Black") || !pens.includes("White"))){
                    this.engine.addChoice(choice.Text,choice);
                }
                else if(choice.Requirement == test){
                    this.engine.addChoice(choice.Text,choice);
                }
                //else{
                //    this.engine.show(choice.Requirement+","+test);
                //}
            }
        } else {
            this.engine.addChoice("The end.")
        }
    }

    handleChoice(choice) {
        if(choice.isPen == "true"){
            //this.engine.show("adding pen to list");
            pens.push(choice.Text);
            pensStolen += 1;
        }
        if(choice) {
            this.engine.show("&gt; "+choice.Text);
            if(choice.Target == "Intro")
                this.engine.gotoScene(Location, choice.Target);
            else
                this.engine.gotoScene(Home, choice.Target);
        } else {
            this.engine.gotoScene(End);
        }
    }
}

class Ending extends Scene {
    
}

class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');