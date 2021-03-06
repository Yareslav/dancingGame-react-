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
    exception: null,
  });
  return (
    <MainApp.Provider value={{ state, setActive }}>
      {state.active ? <Form /> : <Game />}
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
          Cyber city : <span>{location["Cyber City"]}</span>
        </p>
        <p>
          Sunny Beach : <span>{location["Sunny Beach"]}</span>
        </p>
        <p>
          Dancing Scene : <span>{location["Dancing Scene"]}</span>
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