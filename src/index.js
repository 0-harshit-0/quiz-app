import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';


window.localStorage.setItem("scores", JSON.stringify([]));
let questions = [
  {
    q: "Commonly used data types DO NOT include:",
    ansList: ["strings", "boolean", "alert", "number"],
    correct: "alert"
  },
  {
    q: "Array in JavaScript can be used to store ______:",
    ansList: ["numbers and strings", "other arrays", "booleans", "all of the above"],
    correct: "all of the above"
  }
];


/* ---------------------------------------------------------------------------*/
class Top extends React.Component {
  constructor(props) {
    super(props);
    this.highscoreBox = this.highscoreBox.bind(this);
  }

  highscoreBox() {
    const value = this.context;
    this.props.currentScreen.type.name !== "QuizQuestions"
     && this.props.currentScreen.type.name !== "Highscores"
     && value.changeBoxContent(<Highscores backTo={this.props.currentScreen} />);
  }
  render() {
    return(
      <header className="header">
        <button className="highscore" onClick={this.highscoreBox}>View Highscores</button>
        <span>Time: {this.props.time}</span>
      </header>
    );
  }
}

class Highscores extends React.Component {
  constructor(props) {
    super(props);
    this.highscoreBoxOver = this.highscoreBoxOver.bind(this);
    this.handleListItems = this.handleListItems.bind(this);
    this.state = {list:JSON.parse(window.localStorage.getItem("scores")).map((z,i)=>{
        return <li key={i.toString()}>{z.name} - {z.score}</li>
      })};
  }
  highscoreBoxOver() {
    const value = this.context;
    value.changeBoxContent(this.props.backTo);
  }
  handleListItems(clear) {
    clear && window.localStorage.setItem("scores", JSON.stringify([]));
    this.setState({list:""});
  }
  render() {
    return (
      <>
        <h2>Highscores:</h2>
        <ol className="scoreList">
        {
          this.state.list
        }
        </ol>
        <section className="scoreBtns">
          <button onClick={this.highscoreBoxOver}>Go Back</button>
          <button onClick={()=> this.handleListItems(true)}>Clear Highscores</button>
        </section>
      </>
    );
  }
}

/*---------------main body------------------*/
class QuizHome extends React.Component {
  constructor(props) {
    super(props);
    this.startQuiz = this.startQuiz.bind(this);
    this.props.setTime();
  }
  startQuiz() {
    this.props.startTime();
    const value = this.context;
    value.changeBoxContent(<QuizQuestions {...this.props} />);
  }
  render() {
    return (
      <>
        <h1>Coding Quiz Challenge</h1>
        <p>
          Try to answer code-related question in the given time.<br />
          Keep in mind that incorrect answers will penalize your score/time by 10 seconds!
        </p>
        <button onClick={this.startQuiz}>Start Quiz</button>
      </>
    );
  }
}

class QuizQuestions extends React.Component {
  constructor(props) {
    super(props);
    this.checkSolution = this.checkSolution.bind(this);
    this.currQuestionNo = 0;
    this.state = {correctStatus:"", question:questions[0]};
  }

  checkSolution(e) {
    if(this.checked) return;
    this.checked = true;

    if(e.target.innerText === this.state.question.correct) {
      e.target.classList.toggle("correct");
      this.setState({correctStatus:"Correct!"});
    }else{
      e.target.classList.toggle("incorrect");
      this.setState({correctStatus:"Incorrect!"});
      this.props.timeSub();
    }
    if(++this.currQuestionNo < questions.length) {
      setTimeout(()=>{
        this.checked = false;
        this.setState({correctStatus:"",question:questions[this.currQuestionNo]});
      }, 500);
    }else {
      setTimeout(()=>{
        const value = this.context;
        value.changeBoxContent(
          <Over {...this.props} />
          );
      }, 500);
    }
  }
  
  render() {
    let items = this.state.question.ansList.map(z=> {
      return <li key={z.toString()} onClick={this.checkSolution}>{z}</li>
    });
    return (
      <>
        <h2>{this.state.question.q}</h2>
        <ol className="answers">
          {items}
        </ol>
        <hr />
        <span>{this.state.correctStatus}</span>
      </>
    );
  }
}
/* ---------------------Game Over------------------------*/
class Over extends React.Component {
  constructor(props) {
    super(props);
    this.saveScore = this.saveScore.bind(this);
    this.state = {name:""}
  }
  saveScore() {
    const value = this.context;

    let d = JSON.parse(window.localStorage.getItem("scores"));
    d.push({name:this.state.name, score: value.getScore()});
    window.localStorage.setItem("scores", JSON.stringify(d));
    
    value.changeBoxContent(<QuizHome {...this.props} />);
  }
  render() {
    const value = this.context;
    return (
      <>
        <h2>All done!</h2>
        <p>Your final score is {value.getScore()}</p>
        <section className="highScoreRegister">
          <label>Enter Initials:</label><input type="text" onChange={(e)=>this.setState({name:e.target.value})} />
          <button onClick={this.saveScore}>Submit</button>
        </section>
      </>
    );
  }
}

/* ---------------------------------------------*/
const DataContext = React.createContext();
QuizHome.contextType = DataContext;
QuizQuestions.contextType = DataContext;
Over.contextType = DataContext;
Highscores.contextType = DataContext;
Top.contextType = DataContext;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleContentChange = this.handleContentChange.bind(this);
    this.handleTimeSub = this.handleTimeSub.bind(this);
    this.startTime = this.startTime.bind(this);
    this.getTime = this.getTime.bind(this);
    this.setTime = this.setTime.bind(this);
    this.state = {time: 0,
      content:<QuizHome timeSub={this.handleTimeSub} startTime={this.startTime} setTime={this.setTime} />,
      value:{changeBoxContent:this.handleContentChange, getScore:this.getTime}
    };
  }
  startTime() {
    this.timerID = setInterval(()=>{
      let tti = this.state.time;
      this.setState({time: --tti});
      if(this.state.time <= 0) {
        this.componentWillUnmount();
      }
    },1000);
  }
  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  getTime() {
    this.componentWillUnmount();
    return this.state.time;
  }
  setTime() {
    this.setState({time:100});
  }
  handleTimeSub(e) {
    this.setState({time: this.state.time-10});
  }
  handleContentChange(e) {
    this.setState({content:e});
  }
  render() {
    return(
      <DataContext.Provider value={this.state.value}>
        <Top currentScreen={this.state.content} time={this.state.time} />
        <main>
          <section className="box">
            {this.state.content}
          </section>
        </main>
      </DataContext.Provider>
    );
  }
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
