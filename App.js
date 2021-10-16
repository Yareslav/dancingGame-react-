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
import Game from "./Game";
export const MainApp = createContext();
export default function App() {
  var [state, setActive] = useState({
    active: true,
    exception: 0,
  });
  return (
    <MainApp.Provider value={{ state, setActive }}>
      {state.active ? <Form /> : <Game />}
      {/* <Game/> */}
    </MainApp.Provider>
  );
}
export function random(a, b) {
  return Math.floor(a + Math.random() * (b + 1 - a));
}
export function convert(data, type = "png",sound) {
  if (!sound) return require(`./images/${data}.${type}`).default;
  else return require(`./audio/${data}.mp3`).default;
}
export function log(...mass) {
  mass.forEach((elem)=>{
    if (typeof (elem)==`object` && !Array.isArray(elem)) console.table(elem)
    else if (Array.isArray(elem)) console.log(...elem);
    else {
      var _=[
      {
        type:"number",
        fontWeight:600,
        color:`#EA63F0`
      },
      {
        type:"blight",
        fontWeight:900,
        color:`#DD161F`
      },
      {
        type:"string",
        fontWeight:100,
        color:`#F8E30D`
      },
      {
        type:"boolean",
        fontWeight:900,
        color:`#0D14F8`
      },
      {
        type:"function",
        fontWeight:400,
        color:`#08ECC9`
      },
      {
        type:"undefined",
        fontWeight:900,
        color:`#F70A0A`
      },
    ].forEach((item)=>{
        if (typeof elem==item.type) console.log(`%c ${elem}`,`color:${item.color}; font-weight:${item.fontWeight}`);
      })
    }
  })
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
      speed:1
    },
    {
      img: "dance",
      name: `Dancing Scene`,
      speed:1.2
    },
    {
      img: `retroCar`,
      name: `Cyber city`,
      speed:1.3
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
    if (!state.exception && state.exception!==0) return;
    setActive({ ...state, active: false });
  }
  function click(eve) {
    if ($(eve.target).is(`.form`)) setActive({ ...state, exception: "" });
  }
  return (
    <div className="form beet2" onClick={click}>
      <div className="form__main-text beet">
        <img src={convert("dancingPeople1")} alt="" />
        <p>Welcome to dancing game </p>
        <img src={convert("dancingPeople2")} alt="" />
      </div>
      <p className="form__select">select the map </p>
      <div className="form__maps beet">{maps}</div>
      <div
        className={"form__button center " + ((state.exception || state.exception===0) ?  "" : "disallowPress")}
        onClick={startGame}
      >
        PLAY
      </div>
      <p className="form__author">
        Author : <span>Yarema</span>
      </p>
      <div className="form__records typicalText">
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
    </div>
  );
}
