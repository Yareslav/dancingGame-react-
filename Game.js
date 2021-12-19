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
import { MainApp, convert, random, log } from "./App";
import * as Help from "./HelpComponents";
export const MainGame = createContext();
export const shitCorrectsBugWithUseEffect = { display: {}, allow: null };
export default function Game() {
  const propsData = useContext(MainApp);
  var data = useRef({}).current;
  var [display, setDisplay] = useState({
    stopped: false,
    allowControl: false,
    reload: false,
    allowSound: false,
    hardness: `easy`,
    hardnessTypes: {
      easy: "easy",
      medium: `medium`,
      hard: `hard`,
      extreme: `extreme`,
    },
    //!!syncronise
    score: 0,
    coefficient: 1,
    health: { normal: 50, max: 50 },
    //!!syncronise
  });
  useMemo(() => {
    var _ = [
      {
        type: "Sunny Beach",
        decorGif1: `dancingSpongeBob`,
        decorGif2: `dancingPatric`,
        fonImg: "beach",
        speed: 50,
        song: `Rumble`,
        damage: 6,
      },
      {
        type: "Dancing Scene",
        decorGif1: `discoBall`,
        decorGif2: `dancingMan`,
        fonImg: `dance`,
        speed: 60,
        song: `Caramelldansen`,
        damage: 7,
      },
      {
        type: "Cyber City",
        decorGif1: `discoBall`,
        decorGif2: `dancingMan`,
        fonImg: `retroCar`,
        speed: 40,
        song: `Monster`,
        damage: 5,
      },
    ].forEach((elem, ind) => {
      if (propsData.state.exception == ind) {
        Object.entries(elem).forEach((elem) => {
          data[elem[0]] = elem[1];
        });
      }
    });
    data.bestRecord = JSON.parse(localStorage.getItem("locationsPoints"))[
      data.type
    ];
  }, []);
  useEffect(() => {
    setTimeout(() => {
      setDisplay({ ...display, allowControl: true, allowSound: true });
    }, 3000);
  }, []);
  shitCorrectsBugWithUseEffect.display = display;
  return (
    <MainGame.Provider value={[display, setDisplay]}>
      <div className="game beet2">
        <Help.Audio src={data.song} active={display.allowSound} />
        <Help.Canvas />
        <Help.GameLine bestRecord={data.bestRecord} />
        <GameField decor={data} />
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
  class ProcessChangeGenerateStatus {
    constructor(generateStatus) {
      this.status = generateStatus;
      const { hardnessTypes } = display;
      const { types, statuses } = this.status;
      var finalValue;
      var _ = [
        [hardnessTypes.easy, 15],
        [hardnessTypes.medium, 10],
        [hardnessTypes.hard, 8],
        [hardnessTypes.extreme, 3],
      ].forEach((elem) => {
        if (display.hardness == elem[0]) finalValue = elem[1];
      });
      //*remove all generation settings
      if (this.status.iterations == 0) {
        this.status.status = statuses.normal;
        this.status.type = types.random;
      }
      const randomNum = random(0, finalValue);
      if (!(randomNum == 0 && this.status.iterations === 0)) return;
      this.changeType();
    }
    changeType() {
      return;
      const { hardnessTypes } = display;
      const { types, statuses } = this.status;
      for (let key in hardnessTypes) {
        if (hardnessTypes[key]==display.hardness) {
          var boolMass = this.analyzePreviousTypes();
          if (boolMass.oneType) {
            this.status.type = types.oneType;
          } else if (boolMass.twoType) {
            this.status.type = types.twoType;
          } else if (boolMass.allByOrder) {
            this.status.type = types.allByOrder;
          } else {
            this.status.type = types.random;
          }
        }
      }
      this.status.previousElementsMass.push(this.status.type);
      this.changeStatusAndSetIterations();
    }
    analyzePreviousTypes() {

    }
    changeStatusAndSetIterations() {
      const { hardnessTypes } = display;
      const { types, statuses } = this.status;
      var _ = [
        {
          type: types.random,
          cases: [
            {
              hardness: hardnessTypes.easy,
              mass: [3, 60],
              iterations: [20, 40],
            },
            {
              hardness: hardnessTypes.medium,
              mass: [3, 30],
              iterations: [15, 30],
            },
            {
              hardness: hardnessTypes.hard,
              mass: [2, 5],
              iterations: [0, 15],
            },
            {
              hardness: hardnessTypes.extreme,
              mass: [3, 1],
              iterations: [7, 12],
            },
          ],
        },
        {
          type: types.oneType,
          cases: [
            {
              hardness: hardnessTypes.easy,
              mass: [1, 3],
              iterations: [13, 30],
            },
            {
              hardness: hardnessTypes.medium,
              mass: [2, 2],
              iterations: [13, 25],
            },
            {
              hardness: hardnessTypes.hard,
              mass: [3, 1],
              iterations: [10, 20],
            },
            {
              hardness: hardnessTypes.extreme,
              mass: [50, 0],
              iterations: [15, 25],
            },
          ],
        },
        {
          type: types.twoType,
          cases: [
            {
              hardness: hardnessTypes.easy,
              mass: [2, 1],
              iterations: [8, 16],
            },
            {
              hardness: hardnessTypes.medium,
              mass: [2, 1],
              iterations: [12, 24],
            },
            {
              hardness: hardnessTypes.hard,
              mass: [3, 0],
              iterations: [16, 30],
            },
            {
              hardness: hardnessTypes.extreme,
              mass: [100, 0],
              iterations: [13, 26],
            },
          ],
        },
        {
          type: types.allByOrder,
          cases: [
            {
              hardness: hardnessTypes.easy,
              mass: [1, 4],
              iterations: [15, 25],
            },
            {
              hardness: hardnessTypes.medium,
              mass: [2, 2],
              iterations: [18, 27],
            },
            {
              hardness: hardnessTypes.hard,
              mass: [4, 1],
              iterations: [20, 30],
            },
            {
              hardness: hardnessTypes.extreme,
              mass: [1, 1],
              iterations: [30, 40],
            },
          ],
        },
      ].forEach((elem) => {
        if (elem.type != this.status.type) return;
        elem.cases.forEach((value) => {
          if (value.hardness != value.hardness) return;
          if (random(0, value.mass[0]) == 0)
            this.status.status = statuses.medium;
          else if (random(0, value.mass[1]) == 0)
            this.status.status = statuses.spam;
          else this.status.status = statuses.normal;
          this.status.iterations = random(
            value.iterations[0],
            value.iterations[1]
          );
        });
      });
    }
  }
  class Process {
    intervals = {
      healthWarning: null,
      main: null,
      changeGenerateStatus: null,
    };
    period = { normal: 0, max: null };
    health = { normal: 50, max: 50 };
    stopped = false;
    gameStatics = { combo: 0, coefficient: 1, score: 0, misses: 0 };
    attributes = { speed: 45, damage: null, maxRenderLimit: 15 };
    arrowMass = [];
    result;
    generateStatus = {
      previousElementsMass: [],
      iterations: 0,
      status: `normal`,
      statuses: {
        normal: 1,
        medium: 0.7,
        spam: 0.33,
      },
      type: `random`,
      previousStatusMass: [],
      types: {
        random: `random`,
        allByOrder: `allByOrder`,
        oneType: `oneType`,
        twoType: `twoType`,
      },
    };
    constructor({ speed, damage }) {
      this.period.max = speed;
      this.attributes.damage = damage;
      Object.entries(gameStat.colors).forEach((elem, ind) => {
        this.arrowMass.push({ type: elem[0], mass: [] });
      });
      this.setColumns();
      setTimeout(() => this.start(), 3000);
    }
    start() {
      this.intervals.main = setInterval(
        () => this.render(),
        this.attributes.speed
      );
      this.intervals.healthWarning = setInterval(() => {
        if (this.health.normal < this.health.max / 4)
          gameMarkStatus.events = `health`;
      }, 5000);
      this.intervals.changeGenerateStatus = setInterval(
        () => new ProcessChangeGenerateStatus(this.generateStatus),
        1000
      );
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
      const { statuses } = this.generateStatus;
      for (let key in statuses) {
        if (statuses[key] != this.generateStatus.status) continue;
        const value = Math.floor(this.period.max * statuses[key]);
        if (value < this.attributes.maxRenderLimit)
          value = this.attributes.maxRenderLimit;
        if (this.period.normal >= value) {
          this.generate();
          this.period.normal = 0;
        } else this.period.normal++;
      }
      this.setColumns();
    }
    generate() {
      const { type, previousElementsMass, types } = this.generateStatus;
      if (this.generateStatus.iterations > 0) this.generateStatus.iterations--;
      var index;
      function generateCurrentElement(...indexes) {
        var ind;
        function getAmongIndexes() {
          var value = false;
          indexes.forEach((elem) => {
            if (ind == elem) value = true;
          });
          return value;
        }
        do {
          ind = random(0, 3);
        } while (getAmongIndexes());
        return ind;
      }
      if (type != types.random && previousElementsMass.length == 0) {
        index = random(0, 3);
        previousElementsMass.push(index);
      } else {
        if (type == types.random) index = random(0, 3);
        else if (type == types.oneType) index = previousElementsMass[0];
        else if (type == types.twoType) {
          if (previousElementsMass.length == 1)
            index = generateCurrentElement(previousElementsMass[0]);
          else if (previousElementsMass.length == 2) {
            index = previousElementsMass.shift();
          }
          previousElementsMass.push(index);
        } else if (type == types.allByOrder) {
          if (previousElementsMass.length == 4) {
            index = previousElementsMass.shift();
          } else {
            index = generateCurrentElement(...previousElementsMass);
          }
          previousElementsMass.push(index);
        }
      }
      this.arrowMass[index].mass.unshift({ y: 0, destroyed: false });
    }
    stop() {
      for (let key in this.intervals) {
        clearInterval(this.intervals[key]);
      }
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
      }, 250);
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
    set changePeriod(hardness) {
      this.period.max = Math.ceil(this.period.max * 0.8);
      this.period.normal = 0;
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
      const gameStatics = this.gameStatics;
      const { normal } = this.health;
      if (miss) {
        if (gameStatics.misses < 3) heal = -this.attributes.damage;
        else if (gameStatics.misses > 3 && gameStatics.misses < 7)
          heal = -this.attributes.damage * 2;
        else heal = -this.attributes.damage * 3;
      } else {
        if (gameStatics.combo > 10 && gameStatics.combo < 20)
          heal = this.attributes.damage * 0.1;
        else if (gameStatics.combo > 20) heal = this.attributes.damage;
      }
      this.health.normal += heal;
      this.health.normal = +this.health.normal.toFixed(1);
      if (normal > this.health.max) this.health.normal = this.health.max;
      else if (normal < 0) this.health.normal = 0;
    }
  }
  useEffect(() => {
    resize();
    $(window).on(`resize`, resize);
    function resize() {
      $(`.game__field`).css({ height: $(window).height() * 0.8 });
    }
    processControl.current = new Process(gameStat);
  }, []);
  useMemo(() => {
    gameStat.current = { ...decor };
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
  useMemo(() => {
    if (processControl.current)
      processControl.current.changePeriod = display.hardness;
  }, [display.hardness]);
  gameStat = gameStat.current;
  return (
    <div
      className="game__field beet"
      onMouseDown={(eve) => eve.preventDefault()}
    >
      <img
        className="game__gif"
        src={convert(gameStat.decorGif1, "gif")}
        id="first"
      />
      <div
        className="game__process beet"
        style={{ backgroundImage: `url(${convert(gameStat.fonImg, "gif")})` }}
      >
        <Help.GameMark gameMarkStatus={gameMarkStatus} />
        <div className="game__columns beet">{columns}</div>
      </div>
      <img
        src
        className="game__gif"
        src={convert(gameStat.decorGif2, "gif")}
        id="last"
      />
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
    const height_ = $(`.game__arrow`).height() * 0.5;
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
    elem.animate({ width: columnWidth, height: columnWidth }, 125, () => {
      elem.animate({ width: 0, height: 0 }, 125);
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
