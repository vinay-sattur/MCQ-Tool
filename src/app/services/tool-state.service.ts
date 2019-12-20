import { Injectable } from '@angular/core';

declare var EZ:any;

@Injectable({
  providedIn: 'root'
})
export class ToolStateService {

  private optionsList = ["Option 1", "Option 2", "Option 3", "Option 4"]; // Hard code for now. It should be dynamically updated.

  private selectedOption;

  private solution;

  private studentAnswer;

  loading = {value: false};

  constructor() { }

  getOptionsList(){
    return this.optionsList;
  }

  getSolution(){
    return this.solution;
  }

  getStudentAnswer(){
    return this.studentAnswer;
  }

  getStateJSON(){
    var state = {
      "options": this.optionsList,
      "solution": this.solution,
      "answer": this.studentAnswer
    }
    return state;
  }

  getState(){
    var state:any = this.getStateJSON();
    return JSON.stringify(state);
  }

  getDefinition(){
    var state:any =  this.getStateJSON();
    return JSON.stringify(state.options);
  }

  getKey(){
    var state:any = this.getStateJSON();
    return JSON.stringify(state.solution);
  }

  getResponse(){
    var state:any = this.getStateJSON();
    return JSON.stringify(state.answer);
  }

  getScore(state?:any){
    if(!state){
      state = this.getState();
    }
    
    if(state.solution == state.answer){
      return 100;
    }else{
      return 0;
    }
  }

  getResults(question, response, solution){
    var requiredObj:any = {};
    // cstate = EZ.getKey();
    try {
      console.time('Combine states');
      var state = this.combineStates(question, response, solution);
      console.timeEnd('Combine states');
      var scoreResult = {
        score: this.getScore(state),
        grading: {}
      };
      var completion = this.getCompletion(state);
      if (EZ.mode === "design") {
        requiredObj.score = 0;
        requiredObj.grading = {};
        requiredObj.completion = 0;
      } else if (EZ.mode === "preview") {
        requiredObj.score = 0;
        requiredObj.grading = solution;
        requiredObj.completion = 0;
      } else if (EZ.mode === "sample") {
        requiredObj.score = scoreResult.score;
        requiredObj.grading = scoreResult.grading;
        requiredObj.completion = completion;
      } else if (EZ.mode === "review") {
        requiredObj.score = scoreResult.score;
        requiredObj.grading = scoreResult.grading;
        requiredObj.completion = completion;
      } else if (EZ.mode === "test") {
        requiredObj.score = scoreResult.score;
        requiredObj.grading = {};
        requiredObj.completion = completion;
      }
    } catch (e) {
      state = "Error!";
      console.log("error getting results!");
    }
  
    return requiredObj;
  }
  
  getCompletion(state){
    var state:any;
    if(typeof state == "string"){
      state = this.parseState(state);
    }
    
    if(state.answer!=undefined && state.answer!=""){
      return 100;
    }else{
      return 0;
    }
  }

  setState(state:any){
    state = this.parseState(state);
    //this.optionsList = state.options;
    this.solution = state.solution;
    this.studentAnswer = state.response;
    this.loading.value = false;
  }

  setStateResponse(question, response){
    var state = this.combineStates(question, response);
    //this.optionsList = state.options;
    this.solution = state.solution;
    this.studentAnswer = state.response;
    this.loading.value = false;
  }

  parseState(state){
    try{
      return JSON.parse(state);
    }catch(e){
      return "";
    }
  }

  combineStates(question: any, response: any, solution?: any) {
    var state:any = {
      "options": question,
      "solution": solution,
      "answer": response
    };
    return state;
  }

}
