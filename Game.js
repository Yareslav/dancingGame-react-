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
import { MainApp, convert, random,log } from "./App";
import * as Help from "./HelpComponents";
export const MainGame = createContext();
export const shitCorrectsBugWithUseEffect={display:{},allow:null}
export default function Game() {
  const propsData = useContext(MainApp);
  var data = useRef({}).current;
  var [display, setDisplay] = useState({
    stopped: false,
    allowControl: false,
    reload: false,
    allowSound:false,
    //hardness:`easy`, //**can be mistake
    //!!syncronise
    score: 0,
    coefficient: 1,
    health: { normal: 50, max: 50 },
    //!!syncronise
  });
  useMemo(() => {
    var _=[
      {
        type: "Sunny Beach",
        decorGif1: `dancingSpongeBob`,
        decorGif2: `dancingPatric`,
        fonImg: "beach",
        speed: 80,
        song:`Rumble`
      },
      {
        type: "Dancing Scene",
        decorGif1: `discoBall`,
        decorGif2: `dancingMan`,
        fonImg: `dance`,
        speed: 70,
        song:``
      },
      {
        type: "Cyber City",
        decorGif1: `discoBall`,
        decorGif2: `dancingMan`,
        fonImg: `retroCar`,
        speed:90,
        song:``
      }
    ].forEach((elem,ind)=>{
      if (propsData.state.exception==ind) {
        Object.entries(elem).forEach((elem) => {
          data[elem[0]] = elem[1];
        });
      }
    })
    data.bestRecord = JSON.parse(localStorage.getItem("locationsPoints"))[data.type];
  }, []);
  useEffect(() => {
    setTimeout(() => {
      setDisplay({ ...display, allowControl: true,allowSound:true });
    }, 3000);
  }, []);
  shitCorrectsBugWithUseEffect.display=display;
  return (
    <MainGame.Provider value={[display, setDisplay]}>
      <div className="game beet2">
        <Help.Audio src={data.song} active={display.allowSound}/>
        <Help.Canvas />
        <Help.GameLine bestRecord={data.bestRecord} />
        <GameField  decor={data}/>
        <Help.Health />
        <Help.Tips />
      </div>
    </MainGame.Provider>
  );
}
function GameField({ decor }) {
  var gameStat = useRef({}),
    processControl = useRef();
  var [columns, setColumns] = useState([]);
  var [display, setDisplay] = useContext(MainGame);
  const gameMarkStatus = useRef({}).current;
  class Process {
    mainInterval;
    healthWarningInterval;
    period = { normal: null, max: null };
    health = { normal: 50, max: 50 };
    stopped = false;
    gameStatics = { combo: 0, coefficient: 1, score: 0, misses: 0 };
    attributes = { speed: "", damage: "" };
    arrowMass = [];
    result;
    constructor({ speed, damage }) {
      this.attributes.speed = speed;
      this.attributes.damage = damage || 5;
      this.period.normal = this.period.max = 45;
      Object.entries(gameStat.colors).forEach((elem, ind) => {
        this.arrowMass.push({ type: elem[0], mass: [] });
      });
      this.setColumns();
      setTimeout(() => {
        this.start();
      }, 3000);
    }
    start() {
      this.mainInterval = setInterval(() => this.render(), 40); //this.speed
      this.healthWarningInterval = setInterval(() => {
        if (this.health.normal < this.health.max / 4)
          gameMarkStatus.events = `health`;
      }, 5000);
    }
    render() {
      this.arrowMass.forEach((elem) => {
        elem.mass.forEach((arrow, ind) => {
          if (arrow.y >= $(`.game__field`).height()) {
            elem.mass.splice(ind, 1);
            this.changeDisplay(true);
          }
          if (!arrow.destroyed) arrow.y += 8;
        });
      });
      if (this.period.normal == this.period.max) {
        this.generate();
        this.period.normal = 0;
      } else this.period.normal++;
      this.setColumns();
    }
    generate() {
      var line = random(0, 3);
      this.arrowMass[line].mass.unshift({ y: 0, destroyed: false });
    }
    stop() {
      clearInterval(this.mainInterval);
      clearInterval(this.healthWarningInterval);
      if (this.result)
        setDisplay((curr) => {
          return { ...curr, allowControl: false };
        });
    }
    setColumns() {
      columns = [];
      Object.entries(gameStat.colors).forEach((elem, ind) => {
        columns.push(
          <FieldColumn
            color={elem[1]}
            keys={gameStat.keys[ind]}
            arrowStatus={this.arrowMass[ind]}
            destroy={this.destroy.bind(this, ind)}
          />
        );
      });
      setColumns([...columns]);
    }
    destroy(column, item) {
      const elem_ = this.arrowMass[column].mass[item];
      if (elem_.destroyed) return;
      const CODE = generateCode();
      elem_.destroyed = true;
      elem_.code = CODE;
      this.changeDisplay();
      setTimeout(() => {
        this.arrowMass[column].mass.forEach((elem, ind) => {
          if (elem.code == CODE) this.arrowMass[column].mass.splice(ind, 1);
        });
      }, 500);
      function generateCode() {
        var str = "";
        const alphabet = [
          "a",
          "b",
          "c",
          "d",
          "e",
          "f",
          "g",
          "h",
          "i",
          "j",
          "k",
          "l",
          "m",
          "n",
          "o",
          "p",
          "q",
          "r",
          "s",
          "t",
          "u",
          "v",
          "w",
          "x",
          "y",
          "z",
        ];
        for (let i = 0; i < 7; i++) {
          if (random(0, 1) == 0) {
            str += alphabet[random(0, alphabet.length - 1)];
          } else {
            str += random(0, 9) + "";
          }
        }
        return str;
      }
    }
    set stopProcess(bool) {
      if (bool) this.stop();
      else if (!bool && this.stopped) this.start();
      this.stopped = bool;
    }
    changeDisplay(miss) {
      if (miss) {
        this.gameStatics.combo = 0;
        this.gameStatics.misses += 1;
        this.gameStatics.coefficient =
          this.gameStatics.coefficient / 2 >= 1
            ? this.gameStatics.coefficient / 2
            : 1;
        gameMarkStatus.miss = true;
        gameMarkStatus.misses = this.gameStatics.misses;
        this.changeHealth(true);
      } else {
        this.gameStatics.combo++;
        this.gameStatics.misses = 0;
        gameMarkStatus.miss = false;
        gameMarkStatus.combo = this.gameStatics.combo;
        if (this.gameStatics.combo > 5) {
          if (this.gameStatics.coefficient <= 2.2)
            this.gameStatics.coefficient += 0.2;
          else if (this.gameStatics.coefficient <= 3)
            this.gameStatics.coefficient += 0.15;
          else if (this.gameStatics.coefficient <= 6)
            this.gameStatics.coefficient += 0.1;
        }
        this.gameStatics.score += 10 * this.gameStatics.coefficient;
        this.changeHealth(false);
      }
      this.gameStatics.coefficient = +this.gameStatics.coefficient.toFixed(2);
      setDisplay((curr) => {
        return {
          ...curr,
          score: this.gameStatics.score,
          coefficient: this.gameStatics.coefficient,
          health: { normal: this.health.normal, max: this.health.max },
        };
      });
    }
    changeHealth(miss) {
      var heal = 0;
      if (miss) {
        if (this.gameStatics.misses < 3) heal = -this.attributes.damage;
        else if (this.gameStatics.misses > 3 && this.gameStatics.misses < 7)
          heal = -this.attributes.damage * 2;
        else heal = -this.attributes.damage * 3;
      } else {
        if (this.gameStatics.combo > 10 && this.gameStatics.combo < 20)
          heal = this.attributes.damage * 0.1;
        else if (this.gameStatics.combo > 20) heal = this.attributes.damage;
      }
      this.health.normal += heal;
      this.health.normal = +this.health.normal.toFixed(1);
      const { normal } = this.health;
      if (normal > this.health.max) this.health.normal = this.health.max;
      else if (normal < 0) this.health.normal = 0;
    }
  }
  useEffect(() => {
    resize();
    $(window).on(`resize`,resize)
    function resize() {
      $(`.game__field`).css({height:$(window).height()*0.8})
    }
    processControl.current = new Process(gameStat);
  }, []);
  useMemo(() => {
    gameStat.current={...decor};
    gameStat.current.colors = {
      red: `231, 76, 60`,
      green: `7,194,18`,
      orange: `243,182,17`,
      blue: `36, 113, 163`,
    };
    gameStat.current.keys = [
      [49, 87, 38], //up - redArrow
      [50, 68, 39], //right greenArrow
      [51, 83, 40], //down yellowArrow
      [52, 65, 37], //left blueArrow
    ];
  }, []);
  useMemo(() => {
    if (processControl.current)
      processControl.current.stopProcess = display.stopped;
  }, [display.stopped]);
  gameStat=gameStat.current;
  return (
    <div
      className="game__field beet"
      onMouseDown={(eve) => eve.preventDefault()}
    >
      <img className="game__gif" src={convert(gameStat.decorGif1, "gif")} id="first"/>
      <div
        className="game__process beet"
        style={{ backgroundImage: `url(${convert(gameStat.fonImg, "gif")})` }}
      >
        <Help.GameMark gameMarkStatus={gameMarkStatus} />
        <div className="game__columns beet">{columns}</div>
      </div>
      <img src className="game__gif" src={convert(gameStat.decorGif2, "gif")} id="last"/>
    </div>
  );
}
function FieldColumn({ color, keys, arrowStatus, destroy }) {
  var [state, setState] = useState({});
  const arrowMass = arrowStatus.mass,
    display = useContext(MainGame)[0];
  function arrowClick() {
    var y;
    var notAnimatedObj = [...arrowMass].filter((elem) => {
      if (!elem.destroyed) return elem;
    });
    if (arrowMass.length == 0 || notAnimatedObj.length == 0 || display.stopped)
      return;
    y = notAnimatedObj[notAnimatedObj.length - 1].y;
    const height_ = $(`.game__arrow`).height()*0.5;
    y += height_;
    if (y >= state.circleY && y <= $(`.game__field`).height() + height_ * 0.45)
      destroy(arrowMass.length - 1);
  }
  useEffect(() => {
    if (!state.circleY || state.ignore) return;
    $(window).on(`keyup`, (eve) => {
      if (eve.which == keys[0] || eve.which == keys[1] || eve.which == keys[2])
        arrowClick();
    });
    setState({ ...state, ignore: true });
  });
  return (
    <div className="game__column">
      {arrowMass.map((elem, ind) => (
        <Arrow
          type={arrowStatus.type + "Arrow"}
          arrowClick={arrowClick}
          destroyed={elem.destroyed}
          y={elem.y}
          color={color}
        />
      ))}
      <CirclePress {...{ arrowClick, color, setState }} />
    </div>
  );
}
function CirclePress({ color, arrowClick, setState }) {
  var its = useRef();
  useEffect(() => {
    changeHeight();
    $(window).on(`resize`, changeHeight);
  }, []);
  function changeHeight() {
    $(its.current).css({ height: $(its.current).width() });
    setState((curr) => {
      return {
        ...curr,
        circleY: $(`.game__field`).height() - $(its.current).width(),
      };
    });
  }
  return (
    <div
      className="game__circle  center"
      ref={its}
      style={{ background: `rgba(${color},0.2)` }}
      onClick={arrowClick}
    >
      <div style={{ background: `rgb(${color})` }}></div>
    </div>
  );
}
function Arrow({ type, arrowClick, destroyed, y, color }) {
  var [ignore, setIgnore] = useState(false);
  var animatedObject = useRef();
  useEffect(() => {
    if (!destroyed || ignore) return;
    const columnWidth = $(`.game__column`).width();
    const elem = $(animatedObject.current);
    elem.animate({ width: columnWidth, height: columnWidth }, 250, () => {
      elem.animate({ width: 0, height: 0 }, 250);
    });
    setIgnore(true);
  });
  if (!destroyed) {
    return (
      <img
        src={convert(type)}
        style={{ top: y }}
        className="game__arrow"
        onClick={arrowClick}
        draggable="false"
      />
    );
  } else {
    return (
      <p
        style={{ top: y, background: `rgba(${color},0.6)` }}
        ref={animatedObject}
        className="explosion"
      ></p>
    );
  }
}
