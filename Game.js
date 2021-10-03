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
import { MainApp, convert, random } from "./App";
const MainGame=createContext()
export default function Game() {
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
        value = "Sunny Beach";
        break;
      case 1:
        value = "Dancing Scene";
        break;
      case 2:
        value = "Cyber City";
        break;
    }
    data.current.type = value;
    data.current.bestRecord = JSON.parse(
      localStorage.getItem("locationsPoints")
    )[value];
  }, []);
  return (
    <MainGame.Provider value={[state,setState]}>
      <div className="game beet2">
      <audio src />
      <Canvas />
      <GameLine bestRecord={data.current.bestRecord} />
      <h4 class="game__title">{data.current.type}</h4>
      <GameField gameType={data.current.type} />
    </div>
    </MainGame.Provider>
  );
}
function GameLine({bestRecord}) {
  const [state,setState]=useContext(MainGame);
  var [controlsIsDown, setControlsIsDown] = useState(false);
  useEffect(() => {
    $(window).on(`resize`, resize);
    function resize() {
      if ($(window).width() <= 550) setControlsIsDown(true);
      else if (!controlsIsDown) setControlsIsDown(false);
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
      {controlsIsDown ? (
        <div className="game__blockDown beet2">{controls}</div>
      ) : null}
    </div>
  );
}
function Canvas() {
  class createCanvas {
    canvas = document.querySelector(`canvas`);
    notesMass = [];
    imgWidth;
    imgHeight;
    interval;
    hardness = {
      generateFrequency: 14,
      speed: 60,
      minGenerateNum: 3,
      maxGenerateNum: 7,
    };
    ctx = this.canvas.getContext(`2d`);
    constructor() {
      this.resize();
      this.setProcess();
      $(window).on(`resize`, () => this.resize());
    }
    setProcess() {
      this.interval = setInterval(() => {
        var felt = this.hardness.generateFrequency;
        if (felt == this.hardness.generateFrequency) {
          this.generate();
          this.fall();
          felt = 0;
        } else {
          felt++;
          this.fall();
        }
      }, this.hardness.speed);
    }
    resize() {
      this.canvas.width = $(window).width();
      this.canvas.height = $(window).height();
      if ($(window).width() >= 550) {
        this.imgWidth = 15;
        this.imgHeight = 35;
      } else {
        this.imgWidth = 10;
        this.imgHeight = 23;
      }
      this.notesMass = [];
    }
    generate() {
      var locations = [],
        colorMass = ["red", `yellow`, `purple`, `blue`];
      const min = this.hardness.minGenerateNum,
        max = this.hardness.maxGenerateNum,
        width = this.canvas.width >= 550;
      var generateNum = width ? random(min, max) : random(min - 2, max - 2);
      const NOTE__SZE = width ? 20 : 14;
      for (let i = 0; i < generateNum; i++) {
        var y;
        do {
          y = random(0, this.canvas.width - NOTE__SZE);
        } while (fillGaps(y));
        locations.push(y);
      }
      function fillGaps(y) {
        var toReturn = false;
        locations.forEach((elem) => {
          if (
            (y > elem && y <= elem + NOTE__SZE) ||
            (y < elem && y >= elem - NOTE__SZE) ||
            y == elem
          )
            toReturn = true;
        });
        return toReturn;
      }
      locations.forEach((elem) => {
        var note = {
          y: 0,
          x: elem,
        };
        note.type = colorMass[random(0, 3)] + `Note`;
        note.index = this.notesMass.length;
        note.width = this.imgWidth;
        note.height = this.imgHeight;
        this.notesMass.push(note);
      });
    }
    fall() {
      var changeIndex = false;
      this.ctx.beginPath();
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.notesMass.forEach((elem) => {
        if (elem.y > this.canvas.height) {
          delete this.notesMass[elem.index];
          changeIndex = true;
          return;
        }
        elem.y += 8;
        var image = new Image(elem.width, elem.height);
        image.src = convert(elem.type);
        image.onload = () => {
          this.ctx.drawImage(image, elem.x, elem.y);
        };
      });
      this.ctx.closePath();
      if (changeIndex) {
        this.notesMass = this.notesMass.filter((elem) => {
          if (elem) return elem;
        });
      }
      this.notesMass.reverse().forEach((elem, ind) => {
        elem.index = ind;
      });
    }
  }
  //useEffect(()=>{new createCanvas()},[])
  return <canvas />;
}
function CirclePress({color,state,setState}) {
  var its=useRef();
  useEffect(() => {
    changeHeight();
    $(window).on(`resize`,changeHeight)
  }, []);
  function changeHeight() {
    $(its.current).css({height:$(its.current).width()*0.49});
    setState({...state,circleY:$(its.current).offset().top-$(`.game__field`).offset().top})
  }
  return (
    <div
    className="game__circle  center"
    ref={its}
    style={{ background: `rgba(${color},0.2)` }}
  >
    <div style={{ background: `rgb(${color})` }}></div>
  </div>
  );
}
function GameMark({type,status}) {

  return (
    <h2 className="game__mark">
      hello world
    </h2>
  )
}
function GameField({gameType}) {
  var gameStat = useRef({}).current , processControl=useRef().current;
  var [columns,setColumns]=useState([]);
  class Process {
    interval;
    period;
    constructor({speed}) {
      this.speed=speed;
      this.arrowMass=[];
      this.generatingPeriod=15;
      this.period=this.generatingPeriod;
      Object.entries(gameStat.colors).forEach((elem,ind) => {
        this.arrowMass.push({type:elem[0],mass:[]})
      });
      this.setColumns();
      this.start();
    }
    start() {
      this.interval=setInterval(()=>this.render(),this.speed)
    };
    render(){
      if (this.period==this.generatingPeriod) {
        this.generate();
        this.period=0;
      } else this.period++;
      this.setColumns()
    };
    generate() {
      //var line=random(0,3);
      this.arrowMass[0].mass.push(<Arrow/>)
    };
    stop() {
      clearInterval(this.interval);
    };
    setColumns() {
      columns=[];
      Object.entries(gameStat.colors).forEach((elem,ind) => {
        columns.push(<FieldColumn color={elem[1]} keys={gameStat.keys[ind]} arrowStatus={this.arrowMass[ind]} setColumns={setColumns}/>);
      });
      setColumns([...columns]);
    };
  }
  useMemo(() => {
    var _ = [
      {
        type: "Sunny Beach",
        decorGif1: `dancingSpongeBob`,
        decorGif2: `dancingPatric`,
        fonImg: "beach",
        speed:80
      },
      {
        type:"Dancing Scene",
        decorGif1:`discoBall`,
        decorGif2:`dancingMan`,
        fonImg:``
      }
    ].forEach((obj) => {
      if (gameType == obj.type) {
        Object.entries(obj).forEach((elem, ind) => {
          if (ind == 0) return;
          gameStat[elem[0]] = elem[1];
        });
      }
    });
    gameStat.colors = {
      red: `231, 76, 60`,
      green: `7,194,18`,
      orange: `243,182,17`,
      blue: `36, 113, 163`,
    };
    gameStat.keys= [
      [49, 35, 67],
      [50, 87, 38],
      [51, 83, 40],
      [52, 68, 39],
    ];
    processControl=new Process(gameStat);
  }, []);
  return (
    <div className="game__field beet" onMouseDown={(eve)=>eve.preventDefault()}>
      <img className="game__gif" src={convert(gameStat.decorGif1, "gif")} />
      <div className="game__process beet" style={{background:`url(${convert(gameStat.fonImg, "gif")})`}}>
      <GameMark/>
        <div className="game__columns beet">{columns}</div>
      </div>
      <img src className="game__gif" src={convert(gameStat.decorGif2, "gif")} />
    </div>
  );
}
function FieldColumn({color,keys,arrowStatus,setColumns}) {
  var [state,setState]=useState({});
  const arrowMass=arrowStatus.mass;
  function arrowClick(y) {

  }
  function deleteComponent() {
    arrowMass.splice(this,1);
  }
  useEffect(()=>{
    $(window).on(`keyup`, (eve) => {
      if (eve.which == keys[0] || eve.which == keys[1] || eve.which == keys[2]) arrowClick();
    });
  },[]);
  return (
    <div className="game__column">
      {arrowMass.map((elem,ind)=><Arrow type={arrowStatus.type+"Arrow"} arrowClick={arrowClick} deleteComponent={deleteComponent.bind(ind)}/>)}
      <CirclePress color={color} {...{state,setState}}/>
    </div>
  )
}
function Arrow({type,deleteComponent,arrowClick}) {
  var [state,setState]=useState({y:0,fallen:false,destroyed:false,ignore:false});
  var animatedObject=useRef();
  const columnWidth=$(`.game__column`).width();
  function fallingProcess() {
    if (state.destroyed || state.fallen) return;
    state.y+=8;
    if (state.y>$(`.game__process`).height()) {
      setState({...state,fallen:true})
    }
  }
  function render() {
    if (!state.destroyed && !state.fallen) {
      return (
        <img src={convert(type)} style={{top:state.y}} className="game__arrow" onClick={()=>arrowClick(state.y)} draggable="false"/>
      )
    }
    else if (state.fallen && !state.ignore) {
      deleteComponent();
      state.ignore=true;
      return null;
    }
    else {
       if (!state.ignore) setTimeout(()=>deleteComponent(),1500);
      return <p style={{top:state.y+columnWidth/2}} ref={animatedObject} className="explosion"></p>;
    }
  }
  function click() {}
  useEffect(()=>{
    if (!state.destroyed || !state.ignore) return;
    state.ignore=true;
    const elem=$(animatedObject.current);
    elem.animate({width:columnWidth,height:columnWidth},250,()=>{
      elem.animate({width:0,height:0},250)
    })
  })
  fallingProcess();
  return render();
}