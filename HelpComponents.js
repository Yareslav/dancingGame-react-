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
import { MainGame, shitCorrectsBugWithUseEffect } from "./Game";
import { convert, random, log } from "./App";
export default null;
export function Pause() {
  var [display, setDisplay] = useContext(MainGame);
  const [allow, setAllow] = useState(true);
  shitCorrectsBugWithUseEffect.allow = allow;
  function change() {
    display = shitCorrectsBugWithUseEffect.display;
    if (!(display.allowControl && shitCorrectsBugWithUseEffect.allow)) return;
    if (display.stopped) {
      setAllow(false);
      setTimeout(() => {
        setAllow(true);
      }, 2000);
    }
    const apply = !display.stopped;
    setDisplay({ ...display, stopped: apply, allowSound: apply });
  }
  useEffect(() => {
    $(window).on(`keyup`, (eve) => {
      if (eve.which == 32 && eve.ctrlKey) change();
    });
  }, []);
  return (
    <div className="game__controlButton circle center" onClick={change}>
      <img src={convert(display.stopped ? "play" : "pause")} />
    </div>
  );
}
export function Reload() {
  var [display, setDisplay] = useContext(MainGame);
  function change() {
    display = shitCorrectsBugWithUseEffect.display;
    if (display.allowControl) {
      //display.allowControl
      setDisplay({ ...display, reload: true });
    }
  }
  useEffect(() => {
    $(window).on(`keyup`, (eve) => {
      if (eve.which == 82 && eve.altKey) change();
    });
  }, []);
  return (
    <div className="game__controlButton circle center" onClick={change}>
      <img src={convert("reload")} alt />
    </div>
  );
}
export function Health() {
  const [display, setDisplay] = useContext(MainGame);
  const norm = display.health.normal,
    max = display.health.max;
  var color = useRef();
  const res = (norm / max) * 100;
  useMemo(() => {
    if (res > 75) {
      color.current = `#FCF3CF`;
    } else if (res > 33 && res < 75) {
      color.current = `#EDBB99`;
    } else {
      color.current = `#E74C3C`;
    }
  }, [norm]);
  useEffect(() => {
    $(`.game__indicator`).animate(
      {
        width: `${res}%`,
      },
      500
    );
  }, [norm]);
  return (
    <div className="game__health center">
      <div>
        <div
          className="game__indicator"
          style={{ background: color.current }}
        />
        <p className="game__healthResult">
          <span>{norm}</span>/<span>{max}</span>
        </p>
      </div>
    </div>
  );
}
export function Tips() {
  var [state, setState] = useState({ open: false, animate: false, from: null }),
    info = useRef([]);
  function click() {
    if (state.animate) return;
    if (state.open) setState({ ...state, animate: true, from: true });
    else setState({ ...state, animate: true, open: true, from: false });
  }
  useMemo(() => {
    info.current = [];
    var _ = [
      [`stop the game`, `ctrl + space`],
      [`reload the game`, `alt + R`],
      [`destroy red arrow`, `1 , w , down 1`],
      [`destroy green arrow`, `2 , d , down 2`],
      [`destroy orange arrow`, `3 , s , down 3`],
      [`destroy blue arrow`, `4 , a , down 4`],
    ].forEach((elem) => {
      info.current.push(
        <div className="center">
          <p>
            {elem[0] + " : "}
            <span>{elem[1]}</span>
          </p>
        </div>
      );
    });
  }, []);
  useEffect(() => {
    if (!state.animate) return;
    if (!state.from) {
      $(`.tips__container`).hide().slideDown(500).css({ display: "flex" });
    } else {
      $(`.tips__container`).slideUp(500);
    }
    setTimeout(() => {
      if (state.from) setState({ ...state, open: false, animate: false });
      else setState({ ...state, animate: false });
    }, 550);
  });
  return (
    <div className="tips">
      {state.open ? (
        <div className="tips__container beet2">{info.current}</div>
      ) : null}
      <div className="tips__active center circle" onClick={click}>
        <img src={convert("files")} />
      </div>
    </div>
  );
}
export function GameLine({ bestRecord }) {
  const [display, setDisplay] = useContext(MainGame);
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
      <Pause />
      <Reload />
    </>
  );
  return (
    <div className="game__line center">
      <div className="beet">
        <div className="game__points beet2">
          <p>count</p>
          <p>* {display.coefficient}</p>
        </div>
        <p>
          score : <span>{display.score}</span>
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
export function Canvas() {
  const canvas = useRef();
  var display = useContext(MainGame)[0];
  class createCanvas {
    canvas = document.querySelector(`canvas`);
    notesMass = [];
    imgWidth;
    imgHeight;
    interval;
    fallen;
    stopped = false;
    hardness = {
      type: `easy`,
      generateFrequency: 14,
      speed: 60,
      minGenerateNum: 3,
      maxGenerateNum: 7,
    };
    ctx = this.canvas.getContext(`2d`);
    constructor() {
      this.fallen = this.hardness.generateFrequency;
      this.resize();
      this.start();
      $(window).on(`resize`, () => this.resize());
    }
    start() {
      this.interval = setInterval(() => {
        this.render();
      }, this.hardness.speed);
    }
    stop() {
      clearInterval(this.interval);
    }
    render() {
      if (this.fallen >= this.hardness.generateFrequency) {
        this.generate();
        this.fall();
        this.fallen = 0;
      } else {
        this.fallen++;
        this.fall();
      }
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
    set stopProcess(bool) {
      if (bool) this.stop();
      else if (!bool && this.stopped) this.start();
      this.stopped = bool;
    }
    set setHardness(hardness) {
      if (this.hardness.type == hardness) return;
      var hard = this.hardness;
      hard.speed -= 10;
      hard.maxGenerateNum += 2;
      if (hardness == `medium`) {
        hard.generateFrequency -= 2;
        hard.minGenerateNum += 1;
      } else {
        hard.generateFrequency -= 3;
        hard.minGenerateNum += 2;
      }
      this.hardness.type = hardness;
      this.stop();
      this.start();
    }
  }
  useEffect(() => {
    canvas.current = new createCanvas();
  }, []);
  useMemo(() => {
    if (canvas.current) {
      canvas.current.stopProcess = display.stopped;
      canvas.current.setHardness = display.hardness;
    }
  }, [display.stopped]);
  return <canvas />;
}
export function Audio({ src, active }) {
  var ref = useRef();
  var [loaded, setLoaded] = useState(false);
  var [display, setDisplay] = useContext(MainGame);
  useEffect(() => {
    if (!loaded) return;
    if (active) ref.current.play();
    else ref.current.pause();
  });
  function load() {
    const timePercent = Math.round(
      (ref.current.currentTime * 100) / ref.current.duration
    );
    var hardness;
    if (timePercent < 30) hardness = `easy`;
    else if (timePercent < 60) hardness = `medium`;
    else hardness = `hard`;
    setDisplay((curr) => {
      return { ...curr, hardness: hardness };
    });
  }
  return (
    <audio
      src={convert(src, null, true)}
      muted
      ref={ref}
      onLoadedMetadata={() => setLoaded(true)}
      onTimeUpdate={load}
    />
  );
}
export function GameMark({ gameMarkStatus }) {
  var [allowTime, setAllowTime] = useState(true);
  const ref = useRef();
  const show = useRef({ style: {}, animate: "", text: "" }).current;
  var keys = Object.keys(gameMarkStatus);
  if (keys.length == 0) return null;
  if (allowTime) {
    if (!gameMarkStatus.global)
      setTimeout(
        () => {
          keys.forEach((elem) => {
            delete gameMarkStatus[elem];
          });
          setAllowTime(true);
        },
        gameMarkStatus.events ? 2000 : 500
      );
    setShow();
    setAllowTime(false);
  }
  function setShow() {
    const colors = {
      black: `#2E4053`,
      yellow: `#FCF3CF`,
      orange: `#EDBB99`,
      blue: `#2471A3`,
      purple: `#6C3483`,
      red: `#E74C3C`,
    };
    const status = {
      hit: () => {
        const { combo } = gameMarkStatus;
        const text = (
          <p style={{ fontFamily: "Are You Serious" }}>combo x {combo}</p>
        );
        if (combo < 5) {
          show.text = `good`;
          show.animate=``
          createStyle(colors.purple);
        } else if (combo > 5 && combo < 18) {
          show.text = (
            <>
              <p>Great</p>
              {text}
            </>
          );
          show.animate=`great`
          createStyle(colors.yellow, 700, 1.2);
        } else {
          show.text = (
            <>
              <p>Wonderful</p>
              {text}
            </>
          );
          show.animate=`wonderful`
          createStyle(colors.orange, 900, 1.5);
        }
      },
      miss: () => {
        const { misses } = gameMarkStatus;
        if (misses < 3) {
          show.text = `Miss`;
          createStyle(colors.red);
          show.animate=``
        } else if (misses > 3 && misses < 8) {
          show.text = `Disgusting`;
          show.animate = `disgusting`;
          createStyle(colors.blue,700,1.3);
        } else {
          show.text = `Terrible`;
          show.animate = `terrible`;
          createStyle(colors.black, 900, 1.5);
        }
      },
      global: () => {
        var _ = [
          { status: `start` },
          { status: `stop` },
          { status: `lost` },
          { status: `won` },
        ].forEach((elem) => {
          if (gameMarkStatus.global == elem.status) {
            elem.style();
            show.text = elem.text;
            show.animate = elem.animate;
          }
        });
      },
      events: () => {
        if (gameMarkStatus.events == `health`) {
          show.text = (
            <>
              <p>WARNING</p>
              <p>Low health</p>
            </>
          );
          show.animate = `warning`;
          createStyle(colors.red, 900, 1.6);
        } else {
        }
      }
    };
    if (gameMarkStatus.global) status.global();
    else if (gameMarkStatus.events) status.events();
    else if (gameMarkStatus.miss) status.miss();
    else if (!gameMarkStatus.miss) status.hit();
    function createStyle(color, fontWeight, size = 1) {
      const obj = {};
        var siz=parseInt(getComputedStyle(ref.current).fontSize) * size;
        if (siz>90) {
          alert(`error`) //**mistake
        }
        obj.color = color;
        obj.fontSize = ref.current
          ? parseInt(getComputedStyle(ref.current).fontSize) * size  + `px`
          : ``;
        obj.fontWeight = fontWeight ? fontWeight : ``;
        show.style = { ...obj };
    }
  }
  return (
    <h2 className={"game__mark " + show.animate} style={show.style} ref={ref}>
      {show.text}
    </h2>
  );
}
