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
      {/* {state.active ? <Form /> : <Game />} */}
      <Game/>
    </MainApp.Provider>
  );
}
export function random(a, b) {
  return Math.floor(a + Math.random() * (b + 1 - a));
}
export function convert(data, type = "png") {
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