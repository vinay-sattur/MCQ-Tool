import { Component, OnInit } from '@angular/core';
import { ToolStateService } from './services/tool-state.service';

declare var window:any;
declare var EZ:any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'MCQ-Tool';
  loading;

  optionsList;

  constructor(public stateService: ToolStateService){
    window.MCQStateService = this.stateService;
  }

  ngOnInit() {
    // if(window.setMethodType == "setState"){
    //   this.stateService.setState(EZ.state);
    // }else{
    //   this.stateService.setStateResponse(EZ.state, EZ.response);
    // }

    this.optionsList = this.stateService.getOptionsList();
    this.loading = this.stateService.loading;
  }

}
