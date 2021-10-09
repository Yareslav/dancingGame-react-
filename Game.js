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
const MainGame = createContext();
export default function Game() {
  const propsData = useContext(MainApp);
  var data = useRef({}).current;
  var [display, setDisplay] = useState({
    stopped: false,
    allowControl: false,
    reload: false,
    //!!syncronise
    score: 0,
    coefficient: 1,
    health: { normal: 50, max: 50 },
    //!!syncronise
  });
  useMemo(() => {
    var value, song;
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
    data.type = value;
    data.song = song;
    data.bestRecord = JSON.parse(localStorage.getItem("locationsPoints"))[
      value
    ];
  }, []);
  useEffect(() => {
    setTimeout(() => {
      setDisplay({ ...display, allowControl: true });
    }, 3000);
  }, []);
  return (
    <MainGame.Provider value={[display, setDisplay]}>
      <div className="game beet2">
        <audio src={data.song} />
        <Canvas />
        <GameLine bestRecord={data.bestRecord} />
        <h4 class="game__title">{data.type}</h4>
        <GameField gameType={data.type} />
        <Health />
        <Tips />
      </div>
    </MainGame.Provider>
  );
}
function GameLine({ bestRecord }) {
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
function Canvas() {
  const canvas=useRef();
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
  useEffect(()=>{
   //canvas.current= new createCanvas()
  },[])
  return <canvas />;
}
function GameField({ gameType }) {
  var gameStat = useRef({}).current,
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
      console.log(this.arrowMass[column].type);
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
    processControl.current = new Process(gameStat);
  }, []);
  useMemo(() => {
    var _ = [
      {
        type: "Sunny Beach",
        decorGif1: `dancingSpongeBob`,
        decorGif2: `dancingPatric`,
        fonImg: "beach",
        speed: 80,
      },
      {
        type: "Dancing Scene",
        decorGif1: `discoBall`,
        decorGif2: `dancingMan`,
        fonImg: ``,
        speed: 70,
      },
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
    gameStat.keys = [
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
  return (
    <div
      className="game__field beet"
      onMouseDown={(eve) => eve.preventDefault()}
    >
      <img className="game__gif" src={convert(gameStat.decorGif1, "gif")} />
      <div
        className="game__process beet"
        style={{ background: `url(${convert(gameStat.fonImg, "gif")})` }}
      >
        <GameMark gameMarkStatus={gameMarkStatus} />
        <div className="game__columns beet">{columns}</div>
      </div>
      <img src className="game__gif" src={convert(gameStat.decorGif2, "gif")} />
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
    const height_ = $(`.game__arrow`).height();
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
function GameMark({ gameMarkStatus }) {
  var [allowTime, setAllowTime] = useState(true);
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
    if (gameMarkStatus.global) {
      var _ = [
        { status: `start` },
        { status: `stop` },
        { status: `lost` },
        { status: `won` },
      ].forEach((elem) => {
        if (gameMarkStatus.global == elem.status) {
          show.style = elem.style;
          show.text = elem.text;
          show.animate = elem.animate;
        }
      });
    } else if (gameMarkStatus.events) {
      if (gameMarkStatus.events == `health`) {
        show.text = (
          <>
            <p>WARNING</p>
            <p>Low health</p>
          </>
        );
      } else {
      }
    } else if (gameMarkStatus.miss) {
      const { misses } = gameMarkStatus;
      if (misses < 3) {
        show.text = `Miss`;
      } else if (misses > 3 && misses < 8) {
        show.text = `Disgusting`;
      } else {
        show.text = `Terrible`;
      }
    } else if (!gameMarkStatus.miss) {
      const { combo } = gameMarkStatus;
      if (combo < 5) {
        show.text = `good`;
      } else if (combo > 5 && combo < 18) {
        show.text = (
          <>
            <p>Great</p>
            <p>combo x {combo}</p>
          </>
        );
      } else {
        show.text = (
          <>
            <p>Wonderful</p>
            <p>combo x {combo}</p>
          </>
        );
      }
    }
  }
  return (
    <h2 className={"game__mark" + show.animate} style={show.style}>
      {show.text}
    </h2>
  );
}
function Pause() {
  const [display, setDisplay] = useContext(MainGame);
  const [allow, setAllow] = useState(true);
  function change() {
    if (!(display.allowControl && allow)) return;
    if (display.stopped) {
      setAllow(false);
      setTimeout(() => {
        setAllow(true);
      }, 2000);
    }
    setDisplay({ ...display, stopped: !display.stopped });
  }
  useEffect(() => {
    $(window).on(`keyup`, (eve) => {
      if (eve.which == 32 && eve.ctrlKey) change(); //*doesn`t work
    });
  }, []);
  return (
    <div className="game__controlButton circle center" onClick={change}>
      <img src={convert(display.stopped ? "play" : "pause")} />
    </div>
  );
}
function Reload() {
  const [display, setDisplay] = useContext(MainGame);
  function change() {
    if (display.allowControl) setDisplay({ ...display, reload: true });
  }
  useEffect(() => {
    $(window).on(`keyup`, (eve) => {
      if (eve.which == 84 && eve.ctrlKey) change();
    });
  }, []);
  return (
    <div className="game__controlButton circle center" onClick={change}>
      <img src={convert("reload")} alt />
    </div>
  );
}
function Health() {
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
function Tips() {
  var [state,setState]=useState({open:false,animate:false,from:null}) , info=useRef([]);
  function click() {
    if (state.animate) return;
    if (state.open) setState({...state,animate:true,from:true})
    else setState({...state,animate:true,open:true,from:false})
  }
  useMemo(()=>{
    info.current=[];
    var _=[
      [`stop the game`,`ctrl + space`],
      [`reload the game`,`ctrl + T`],
      [`destroy red arrow`,`1 , w , down 1`],
      [`destroy green arrow`,`2 , d , down 2`],
      [`destroy orange arrow`,`3 , s , down 3`],
      [`destroy blue arrow`,`4 , a , down 4`],
    ].forEach((elem)=>{
      info.current.push(
        <div className="center">
          <p>
            {elem[0]+" : "}
            <span>{elem[1]}</span>
          </p>
        </div>
      )
    })
  },[])
  useEffect(()=>{
    if (!state.animate) return;
    if (!state.from) {
      $(`.tips__container`).hide().slideDown(500).css({display:"flex"});
    }
    else {
      $(`.tips__container`).slideUp(500);
    }
    setTimeout(()=>{
      if (state.from) setState({...state,open:false,animate:false})
      else setState({...state,animate:false})
    },550);
  })
  return (
    <div className="tips">
    {state.open ?  <div className="tips__container beet2">
        {info.current}
      </div>: null}
    <div className="tips__active center circle" onClick={click}>
        <img src={convert("files")} />
      </div>
    </div>
  );
}