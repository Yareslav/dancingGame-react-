import $ from "./jquery";
import {
  React,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useReducer,
  useContext,
  useRef,
  createContext,
} from "react";
const MainApp = createContext();
export default function App() {
  var [state, setActive] = useState({
    active: true,
    exception: 1,
  });
  return (
    <MainApp.Provider value={{ state, setActive }}>
      {/* {state.active ? <Form /> : <Game />} */}
      <Game />
    </MainApp.Provider>
  );
}
function random(a,b) {
  return Math.floor(a+Math.random()*(b+1-a));
}
function convert(data, type = "png") {
  return require(`./images/${data}.${type}`).default;
}
function Form() {
  var location = useRef(JSON.parse(localStorage.getItem("locationsPoints")));
  location = location.current;
  const { state, setActive } = useContext(MainApp);
  var maps = [];
  var _ = [
    {
      img: "beach",
      name: `Sunny Beach`,
    },
    {
      img: "dance",
      name: `Dancing Scene`,
    },
    {
      img: `retroCar`,
      name: `Cyber city`,
    },
  ].forEach((elem, ind) => {
    maps.push(
      <SelectGameMode
        elem={elem}
        selected={state.exception === ind}
        ind={ind}
      />
    );
  });
  function startGame() {
    if (!state.type) return;
    setActive({ ...state, active: false });
  }
  function click(eve) {
    if ($(eve.target).is(`.form`)) setActive({ ...state, exception: "" });
  }
  return (
    <div class="form beet2" onClick={click}>
      <div class="form__main-text beet">
        <img src={convert("dancingPeople1")} alt="" />
        <p>Welcome to dancing game </p>
        <img src={convert("dancingPeople2")} alt="" />
      </div>
      <p class="form__select">select the map </p>
      <div class="form__maps beet">{maps}</div>
      <div
        class={"form__button center " + (state.type ? "" : "allowPress")}
        onClick={startGame}
      >
        PLAY
      </div>
      <p class="form__author">
        Author : <span>Yarema</span>
      </p>
      <div class="form__records typicalText">
        <div className="beet">
          <img src={convert("counts")} id="counts" />
          <p>PLayed game : </p>
          <span>{localStorage.getItem("playedAGame")}</span>
        </div>
        <div className="beet">
          <img src={convert("money")} id="money" />
          <p>Total money : </p>
          <span>{localStorage.getItem("money")}</span>
        </div>
        <p>
          Cyber city : <span>{location.cyberCity}</span>
        </p>
        <p>
          Sunny Beach : <span>{location.sunnyBeach}</span>
        </p>
        <p>
          Dancing Scene : <span>{location.dancingScene}</span>
        </p>
      </div>
    </div>
  );
}
function SelectGameMode({ elem, selected, ind }) {
  const { state, setActive } = useContext(MainApp);
  function click() {
    setActive({ ...state, exception: ind });
  }
  return (
    <div
      className={"form__block beet2 " + (selected ? "selected" : "")}
      onClick={click}
    >
      <div className="form__resizer center">
        <img src={convert(elem.img, `gif`)} alt="main" />
      </div>
      <p className="form__name">{elem.name}</p>
      <p className="typicalText">Details</p>
    </div>
  );
}
function Game() {
  const propsData = useContext(MainApp);
  var data = useRef({});
  var [state, setState] = useState({
    score: 0,
    stopped: false,
    coefficient: 1,
  });
  useMemo(() => {
    var value;
    switch (propsData.state.exception) {
      case 0:
        value = "sunnyBeach";
        break;
      case 1:
        value = "dancingScene";
        break;
      case 2:
        value = "cyberCity";
        break;
    }
    data.current.type = value;
    data.current.bestRecord = JSON.parse(
      localStorage.getItem("locationsPoints")
    )[value];
  }, []);
  return (
    <div className="game">
      <audio src />
      <Canvas/>
      <GameLine state={state} bestRecord={data.current.bestRecord}/>
      <GameField/>
    </div>
  );

}
function GameLine({state,bestRecord}) {
  var [controlsIsDown,setControlsIsDown]=useState(false)
  useEffect(() => {
    $(window).on(`resize`, resize);
    function resize() {
      if ($(window).width() <= 550)
      setControlsIsDown(true);
      else if (!controlsIsDown)
      setControlsIsDown(false);
    }
    resize();
  }, []);
  var controls = (
    <>
      <div className="game__pause center">
        <img src={convert(state.stopped ? "start" : "pause")} />
      </div>
      <div className="game__reload center">
        <img src={convert("reload")} alt />
      </div>
    </>
  );
  return (
    <div className="game__line center">
      <div className="beet">
        <div className="game__points beet2">
          <p>count</p>
          <p>* {state.coefficient}</p>
        </div>
        <p>
          score : <span>{state.score}</span>
        </p>
        <p>
          Best record : <span>{bestRecord}</span>
        </p>
        {controlsIsDown ? null : controls}
      </div>
      {controlsIsDown ? <div className="game__blockDown beet2">{controls}</div> : null}
    </div>
  );

}
function Canvas() {
  class createCanvas {
    canvas=document.querySelector(`canvas`)
    notesMass=[]
    imgWidth;
    imgHeight;
    interval;
    hardness={
      generateFrequency:14,
      speed:60,
      minGenerateNum:3,
      maxGenerateNum:7,
    };
    ctx=this.canvas.getContext(`2d`)
    constructor(){
      this.resize();
      this.setProcess();
      $(window).on(`resize`,()=>this.resize());
    }
    setProcess() {
      this.interval= setInterval(()=>{
        var felt=this.hardness.generateFrequency;
        if (felt==this.hardness.generateFrequency) {
          this.generate();
          this.fall();
          felt=0;
        } else {
          felt++;
          this.fall();
        }
      },this.hardness.speed);
    }
    resize() {
      this.canvas.width=$(window).width()
      this.canvas.height=$(window).height()
      if ($(window).width()>=550) {
        this.imgWidth=15;
        this.imgHeight=35;
      } else {
        this.imgWidth=10;
        this.imgHeight=23;
      }
      this.notesMass=[];
    }
    generate() {
      var locations=[] , colorMass=["red",`yellow`,`purple`,`blue`];
      const min=this.hardness.minGenerateNum , max=this.hardness.maxGenerateNum , width=(this.canvas.width>=550);
      var generateNum=(width) ? random(min,max) : random(min-2,max-2);
      const NOTESZE =width ? 20 : 14;
        for (let i=0;i<generateNum;i++) {
          var y;
          do {
            y=random(0,this.canvas.width-NOTESZE)
          } while (fillGaps(y))
          locations.push(y)
        }
        function fillGaps(y) {
          var toReturn=false;
          locations.forEach((elem)=>{
            if ((y>elem && y<=elem+NOTESZE) || (y<elem && y>=elem-NOTESZE) || y==elem) toReturn=true;
          })
          return toReturn;
        }
        locations.forEach((elem)=>{
          var note={
            y:0,
            x:elem,
          };
          note.type=colorMass[random(0,3)]+`Note`;
          note.index=this.notesMass.length;
          note.width=this.imgWidth;
          note.height=this.imgHeight;
          this.notesMass.push(note)
        })
    }
    fall() {
      var changeIndex=false;
      this.ctx.beginPath()
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
      this.notesMass.forEach((elem)=>{
        if (elem.y>this.canvas.height) {
          delete this.notesMass[elem.index];
          changeIndex=true;
          return;
        }
        elem.y+=8;
        var image=new Image(elem.width,elem.height);
        image.src=convert(elem.type);
        image.onload=()=>{
          this.ctx.drawImage(image,elem.x,elem.y);
        }
      })
      this.ctx.closePath()
      if (changeIndex) {
        this.notesMass=this.notesMass.filter((elem)=>{if (elem) return elem})
      }
      this.notesMass.reverse().forEach((elem,ind)=>{
        elem.index=ind;
      })
    }
  }
  //useEffect(()=>{new createCanvas()},[])
  return (
    <canvas/>
  )
}
function GameField() {
  return (
    <>

    </>
  )
}