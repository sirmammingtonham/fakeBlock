import React, { Component } from "react";
import { render } from "react-dom";
export default class App extends Component{
    render(){
        return<h1>hmm</h1>
    }
}
const appContainer = document.getElementById("app");
render(<App />, appContainer);