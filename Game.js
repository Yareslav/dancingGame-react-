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
    <div className="game beet2">
      <audio src />
      <Canvas />
      <GameLine state={state} bestRecord={data.current.bestRecord} />
      <h4 class="game__title">{data.current.type}</h4>
      <GameField state={state} gameType={data.current.type} />
    </div>
  );
}
function GameLine({ state, bestRecord }) {
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
      const NOTESZE = width ? 20 : 14;
      for (let i = 0; i < generateNum; i++) {
        var y;
        do {
          y = random(0, this.canvas.width - NOTESZE);
        } while (fillGaps(y));
        locations.push(y);
      }
      function fillGaps(y) {
        var toReturn = false;
        locations.forEach((elem) => {
          if (
            (y > elem && y <= elem + NOTESZE) ||
            (y < elem && y >= elem - NOTESZE) ||
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
function GameField({ state, gameType }) {
  var gameStat = useRef({});
  const colors = {
    red: `231, 76, 60`,
    purple: `108, 52, 131`,
    yellow: `237, 187, 153`,
    blue: `36, 113, 163`,
  };
  const keys = [
    [49, 35, 67],
    [50, 87, 38],
    [51, 83, 40],
    [52, 68, 39],
  ];
  useMemo(() => {
    var _ = [
      {
        type: "Sunny Beach",
        decorGif1: `dancingSpongeBob`,
        decorGif2: `dancingPatric`,
        fonImg: "beach",
      },
    ].forEach((obj) => {
      if (gameType == obj.type) {
        Object.entries(obj).forEach((elem, ind) => {
          if (ind == 0) return;
          gameStat.current[elem[0]] = elem[1];
        });
      }
    });
    gameStat.current.lines = [];
    Object.entries(colors).forEach((elem,ind) => {
      gameStat.current.lines.push(<FieldColumn color={elem[1]} key={keys[ind]}/>);
    });
  }, []);
  gameStat = gameStat.current;
  return (
    <div className="game__field beet">
      <img className="game__gif" src={convert(gameStat.decorGif1, "gif")} />
      <div className="game__process beet">
        <img
          src
          className="game__background"
          src={convert(gameStat.fonImg, "gif")}
        />
        <div className="game__columns beet">{gameStat.lines}</div>
      </div>
      <img src className="game__gif" src={convert(gameStat.decorGif2, "gif")} />
    </div>
  );
}
function FieldColumn(props) {
  return (
    <div className="game__column center">
      <CirclePress {...props}/>
    </div>
  )
}
function CirclePress({color,key}) {
  var its=useRef();
  useEffect(() => {
    $(window).on(`keyup`, (eve) => {
        if (eve.which == key[0] || eve.which == key[1] || eve.which == key[2]) circleClick();
    });
    changeHeight();
    $(window).on(`resize`,changeHeight)
  }, []);
  function circleClick() {
  }
  function changeHeight() {
    $(its.current).css({height:$(its.current).width()*0.49})
  }
  return (
    <div
    className="game__circle  center"
    onClick={circleClick}
    ref={its}
    style={{ background: `rgba(${color},0.2)` }}
  >
    <div style={{ background: `rgb(${color})` }}></div>
  </div>
  );
}