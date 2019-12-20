

function getState(){
    return MCQStateService.getState();
}

function setState(state) {
    //Set the type of method called and call the service methode once app loads.
    //window.setMethodType = "setState";
    MCQStateService.setState(state);
}

function setStateResponse(state, response) {
    //Set the type of method called and call the service methode once app loads.
    //window.setMethodType = "setStateResponse";
    MCQStateService.setStateResponse(state, response);
}

function getDefinition() {
    return MCQStateService.getDefinition();
}

function getKey() {
    return MCQStateService.getKey();
}

function getScore() {
    return MCQStateService.getScore();
}

function getCompletion(state) {
    return MCQStateService.getCompletion(state);
}

function getResults(question, response, solution){
    return MCQStateService.getResults(question, response, solution);
}