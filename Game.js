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
    var colors = {
      red: `231, 76, 60`,
      purple: `108, 52, 131`,
      yellow: `237, 187, 153`,
      blue: `36, 113, 163`,
    };
    gameStat.current.lines = [];
    Object.entries(colors).forEach((elem) => {
      gameStat.current.lines.push(
        <div className="game__column center">
          <div
            className="game__circle  center"
            type={elem[0]}
            onClick={() => circleClick(elem[0])}
            style={{ background: `rgba(${elem[1]},0.2)` }}
          >
            <div style={{ background: `rgb(${elem[1]})` }}></div>
          </div>
        </div>
      );
    });
  }, []);
  useEffect(() => {
    var keys = [
      [49, 35, 67, `red`],
      [50, 87, 38, `purple`],
      [51, 83, 40, `yellow`],
      [52, 68, 39, `blue`],
    ];
    $(window).on(`keyup`, (eve) => {
      var key = eve.which;
      keys.forEach((elem) => {
        if (key == elem[0] || key == elem[1] || key == elem[2])
          circleClick(elem[3]);
      });
		});
		$(window).on(`resize`,()=>{
			$(`.game__circle`).each(function () {
				$(this).css({height:})
			})
		})
  }, []);
  gameStat = gameStat.current;
  function circleClick(type) {
    console.log(type);
  }
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
