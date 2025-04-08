(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const Pages = {
  GARAGE: "/garage",
  WINNERS: "/winners",
  NOT_FOUND: "/404"
};
location.hash = "/";
const parseUrl = (url) => {
  const pathParts = url.split("/");
  const result = {
    path: pathParts[0] || "",
    resource: pathParts[1] || ""
  };
  return result;
};
const getCurrentPath = () => window.location.hash ? window.location.hash.slice(1) : window.location.pathname.slice(1);
const redirectToNotFound = (routes2, navigate) => {
  const notFoundRoute = routes2.find(({ path }) => path === Pages.NOT_FOUND);
  notFoundRoute ? navigate(notFoundRoute.path) : console.error("Page not found");
};
const createRouter = (routes2, rootElement) => {
  const navigate = (url) => {
    const { path, resource } = parseUrl(url);
    const fullPath = resource ? `${path}/${resource}` : path;
    const route = routes2.find(({ path: path2 }) => path2 === fullPath);
    if (route) {
      rootElement.replaceChildren();
      route.callback(resource);
    } else {
      redirectToNotFound(routes2, navigate);
    }
    window.history.pushState({}, "", `#${url}`);
  };
  document.addEventListener("DOMContentLoaded", () => navigate(getCurrentPath()));
  window.addEventListener("popstate", () => navigate(getCurrentPath()));
  window.addEventListener("hashchange", () => navigate(getCurrentPath()));
  return { navigate };
};
const carAnimations = /* @__PURE__ */ new Map();
const baseUrl$1 = "http://127.0.0.1:3000";
const driveError = 500;
const roadWidth = window.innerWidth;
const carAnimation = (id, duration) => {
  const currentRoad = document.getElementById(`${id}`);
  const currentCar = currentRoad == null ? void 0 : currentRoad.querySelector("svg path");
  if (currentCar) {
    const animation = currentCar.animate([{ left: "0px" }, { left: `${roadWidth}px` }], {
      duration,
      fill: "forwards",
      easing: "linear"
    });
    carAnimations.set(id, animation);
  }
};
const startEngine = async (id) => {
  try {
    const response = await fetch(`${baseUrl$1}/engine?id=${id}&status=started`, {
      method: "PATCH"
    });
    if (!response.ok) {
      throw new Error(`Ошибка при запуске двигателя: ${response.status}`);
    }
    const { velocity } = await response.json();
    const duration = roadWidth / velocity;
    carAnimation(id, duration);
    await drive(id);
    console.log(velocity, duration, roadWidth);
  } catch (error) {
    console.error("Start engine error:", error);
    stopCarAnimation(id);
  }
};
const drive = async (id) => {
  try {
    const response = await fetch(`${baseUrl$1}/engine?id=${id}&status=drive`, {
      method: "PATCH"
    });
    if (!response.ok) {
      if (response.status === driveError) {
        console.error(`Car has been stopped suddenly. It's engine was broken down`);
        stopCarAnimation(id);
      }
    }
  } catch (error) {
    console.error("Drive error:", error);
  }
};
const stopCarAnimation = (id) => {
  const animation = carAnimations.get(id);
  if (animation) {
    animation.pause();
  }
};
const resetCarAnimation = (id) => {
  const animation = carAnimations.get(id);
  const currentRoad = document.getElementById(`${id}`);
  const currentCar = currentRoad == null ? void 0 : currentRoad.querySelector("svg path");
  if (animation) {
    animation.cancel();
    carAnimations.delete(id);
  }
  if (currentCar instanceof HTMLElement) {
    currentCar.style.left = "0px";
  }
};
const createSvgElement = (color) => {
  const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svgElement.setAttribute("xml:space", "preserve");
  svgElement.setAttribute("viewBox", "0 20 550 300");
  svgElement.setAttribute("width", "80px");
  svgElement.setAttribute("height", "45px");
  svgElement.style.position = "relative";
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    "M188.287 169.428c-28.644-.076-60.908 2.228-98.457 8.01-4.432.62-47.132 24.977-58.644 41.788-11.512 16.812-15.45 48.813-15.45 48.813-3.108 13.105-1.22 34.766-.353 36.872 1.17 4.56 7.78 8.387 19.133 11.154C35.84 295.008 53.29 278.6 74.39 278.574c22.092 0 40 17.91 40 40-.014 1.764-.145 3.525-.392 5.272.59.008 1.26.024 1.82.03l239.266 1.99c-.453-2.405-.685-4.845-.693-7.292 0-22.09 17.91-40 40-40 22.092 0 40 17.91 40 40 0 2.668-.266 5.33-.796 7.944l62.186.517c1.318-22.812 6.86-46.77-7.024-66.72-5.456-7.84-31.93-22.038-99.03-32.66-34.668-17.41-68.503-37.15-105.35-48.462-28.41-5.635-59.26-9.668-96.09-9.765zm-17.197 11.984c5.998.044 11.5.29 16.014.81l7.287 48.352c-41.43-5.093-83.647-9.663-105.964-27.5.35-5.5 7.96-13.462 16.506-16.506 4.84-1.724 40.167-5.346 66.158-5.156zm34.625.348c25.012.264 62.032 2.69 87.502 13.94 12.202 5.65 35.174 18.874 50.537 30.55l-6.35 10.535c-41.706-1.88-97.288-4.203-120.1-6.78l-11.59-48.245zM74.39 294.574a24 24 0 0 0-24 24 24 24 0 0 0 24 24 24 24 0 0 0 24-24 24 24 0 0 0-24-24zm320 0a24 24 0 0 0-24 24 24 24 0 0 0 24 24 24 24 0 0 0 24-24 24 24 0 0 0-24-24z"
  );
  path.setAttribute("fill", color);
  svgElement.appendChild(path);
  return svgElement;
};
function createElement(tag, className, textContent, id, onClick) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  if (id) element.id = id;
  if (onClick) element.addEventListener("click", onClick);
  return element;
}
const generateQueryString = (queryParameters) => queryParameters.length ? `?${queryParameters.map((x) => `${x.key}=${x.value}`).join("&")}` : "";
const baseUrl = "http://127.0.0.1:3000";
let carIdForChange;
let previousName;
const getAmountOfCars = async (queryParameters) => {
  const response = await fetch(`${baseUrl}/garage/${generateQueryString(queryParameters)}`);
  return Number(response.headers.get("X-Total-Count"));
};
const getAllCars = async (container, page, limit2) => {
  const response = await fetch(`${baseUrl}/garage?_page=${page}&_limit=${limit2}`);
  const data = await response.json();
  data.forEach((element) => {
    getCar(element.id, element.name, element.color, container);
  });
};
const getCar = async (id, name, color, container) => {
  const response = await fetch(`${baseUrl}/garage/${id}`);
  await response.json();
  const road = createElement("div", "road", "", `${id}`);
  road.style.borderBottom = "1px solid black";
  road.style.overflow = "visible";
  const carViewManagement = createElement("div");
  const selectCarButton = createElement("button", "select-car btn", "select", "", () => focusOnInput(id, name));
  const removeCarButton = createElement("button", "remove-car btn", "remove", "", () => deleteCar(id));
  const carName = createElement("span", "car-name", name);
  const carDriveManagement = createElement("span");
  const goButton = createElement("button", "go btn", "GO", "", () => startEngine(id));
  const stopButton = createElement("button", "stop btn", "BACK", "", () => resetCarAnimation(id));
  carViewManagement.append(selectCarButton, removeCarButton, carName);
  carDriveManagement.append(goButton, stopButton);
  road.append(carViewManagement, carDriveManagement, createSvgElement(color));
  container.appendChild(road);
};
const createCar = async (body) => {
  const response = await fetch(`${baseUrl}/garage/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  await response.json();
};
const changeCar = async (id, body) => {
  const response = await fetch(`${baseUrl}/garage/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  await response.json();
  const currentRoad = document.getElementById(`${id}`);
  const currentCarName = currentRoad == null ? void 0 : currentRoad.querySelector(".car-name");
  const currentCarColor = currentRoad == null ? void 0 : currentRoad.querySelector("svg path");
  if (currentCarName) {
    currentCarName.textContent = body.name;
  }
  if (currentCarColor) {
    currentCarColor.setAttribute("fill", body.color);
  }
};
const deleteCar = async (id) => {
  const response = await fetch(`${baseUrl}/garage/${id}`, {
    method: "DELETE"
  });
  await response.json();
  renderGarage();
};
const focusOnInput = (id, name) => {
  const input = document.querySelector(".updateCar-name");
  if (input instanceof HTMLInputElement) {
    input.value = "";
  }
  const button = document.querySelector(".update");
  if (button) {
    button.removeAttribute("disabled");
  }
  const updateCarName = document.querySelector(".updateCar-name");
  if (updateCarName instanceof HTMLInputElement) {
    updateCarName.focus();
  }
  carIdForChange = id;
  previousName = name;
};
const updateCarOnPage = () => {
  const button = document.querySelector(".update");
  const updatedName = document.querySelector(".updateCar-name");
  const updatedColor = document.querySelector(".updateCar-color");
  if (updatedName instanceof HTMLInputElement && updatedColor instanceof HTMLInputElement) {
    const newName = updatedName.value.length ? updatedName.value : previousName;
    changeCar(carIdForChange, { name: newName, color: updatedColor.value });
    updatedName.value = "";
  }
  if (button) {
    button.setAttribute("disabled", "");
  }
};
const addCreatedCar = async () => {
  const message = document.querySelector(".error-message");
  const container = document.querySelector(".car-container");
  const newName = document.querySelector(".newCar-name");
  const newColor = document.querySelector(".newCar-color");
  if (newName instanceof HTMLInputElement && newColor instanceof HTMLInputElement && message instanceof HTMLSpanElement && container instanceof HTMLDivElement) {
    if (newName.value.length === 0) {
      message.textContent = "Please, enter the car name!";
      return;
    }
    await createCar({ name: newName.value, color: newColor.value });
    renderGarage();
    newName.value = "";
    message.textContent = "";
  }
};
const createControlPanel = () => {
  const controlPanel = createElement("div", "control-panel");
  const createSection = createElement("div", "create-section");
  const newCarName = createElement("input", "newCar-name");
  const newCarColor = createElement("input", "newCar-color");
  newCarColor.type = "color";
  const createButton = createElement("button", "create btn", "CREATE", "", addCreatedCar);
  const errorMessage = createElement("span", "error-message");
  createSection.append(newCarName, newCarColor, createButton, errorMessage);
  const updateSection = createElement("div", "update-section");
  const updateCarName = createElement("input", "updateCar-name");
  const updateCarColor = createElement("input", "updateCar-color");
  updateCarColor.type = "color";
  const updateButton = createElement("button", "update btn", "UPDATE", "", updateCarOnPage);
  updateButton.setAttribute("disabled", "");
  updateSection.append(updateCarName, updateCarColor, updateButton);
  const buttonsSection = createElement("div", "buttons-section");
  const raceButton = createElement("button", "race btn", "RACE");
  const resetButton = createElement("button", "reset btn", "RESET");
  const generateCarsButton = createElement("button", "generateCars btn", "GENERATE CARS", "", createHundredCars);
  buttonsSection.append(raceButton, resetButton, generateCarsButton);
  controlPanel.append(createSection, updateSection, buttonsSection);
  return controlPanel;
};
let currentPage = 1;
const limit = 7;
let totalCount;
const renderGarage = async () => {
  totalCount = await getAmountOfCars([
    { key: "_page", value: currentPage },
    { key: "_limit", value: limit }
  ]);
  const totalPages = Math.ceil(totalCount / limit);
  renderGarageLayout(totalCount, totalPages);
  await updateGarageContent();
};
const renderGarageLayout = (totalCount2, totalPages) => {
  app.innerHTML = "";
  const pageName = createElement("h1", "title", `Garage (${totalCount2})`);
  const pageNumber = createElement("div", "page-number", `Page #${currentPage} from ${totalPages}`);
  const previousPageButton = createElement("button", "prev-page btn", "prev page", "", showPreviousPage);
  const nextPageButton = createElement("button", "next-page btn", "next page", "", showNextPage);
  const carsContainer = createElement("div", "car-container");
  app.append(createControlPanel(), pageName, pageNumber, previousPageButton, nextPageButton, carsContainer);
};
const showPreviousPage = () => {
  if (currentPage > 1) {
    currentPage--;
    renderGarage();
  }
};
const showNextPage = () => {
  if (currentPage * limit < totalCount) {
    currentPage++;
    renderGarage();
  }
};
const updateGarageContent = async () => {
  const carsContainer = document.querySelector(".car-container");
  if (carsContainer instanceof HTMLDivElement) {
    carsContainer.innerHTML = "";
    await getAllCars(carsContainer, currentPage, limit);
  }
};
const createHundredCars = async () => {
  const carBrands = ["Volvo", "Toyota", "BMW", "Ford", "Nissan", "Hyundai", "Audi", "Mazda", "Kia", "Volkswagen"];
  const carModels = ["XC 90", "Camry", "X5", "Mustang", "Qashqai", "Elantra", "Q7", "CX-5", "Soul", "Passat"];
  const carColors = ["#DC143C", "#1E90FF", "#00FF00", "#2F4F4F", "#87CEEB", "#C0C0C0", "#FFD700", "#FF8C00", "#A0522D", "#4B0082"];
  function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  const cars = Array.from({ length: 100 }, () => ({
    name: `${getRandomItem(carBrands)} ${getRandomItem(carModels)}`,
    color: getRandomItem(carColors)
  }));
  await Promise.all(cars.map((car) => createCar(car)));
  const container = document.querySelector(".car-container");
  if (container instanceof HTMLDivElement) {
    container.innerHTML = "";
    await getAllCars(container, currentPage, limit);
  }
  const totalCount2 = await getAmountOfCars([
    { key: "_page", value: 0 },
    { key: "_limit", value: limit }
  ]);
  const totalPages = Math.ceil(totalCount2 / limit);
  document.querySelector(".title").textContent = `Garage  (${totalCount2})`;
  document.querySelector(".page-number").textContent = `Page #${currentPage} from ${totalPages}`;
};
const renderWinners = () => {
  app.textContent = "Winners";
};
const renderNotFound = () => {
  app.textContent = "404 Not Found";
};
const app = document.createElement("div");
document.body.prepend(app);
const nav = document.createElement("div");
const garageButton = document.createElement("button");
const winnersButton = document.createElement("button");
garageButton.textContent = "Go to Garage";
winnersButton.textContent = "Go to Winners";
garageButton.addEventListener("click", () => {
  window.location.hash = Pages.GARAGE;
});
winnersButton.addEventListener("click", () => {
  window.location.hash = Pages.WINNERS;
});
nav.appendChild(garageButton);
nav.appendChild(winnersButton);
document.body.prepend(nav);
const routes = [
  { path: "", callback: () => renderGarage() },
  { path: Pages.GARAGE, callback: () => renderGarage() },
  { path: Pages.WINNERS, callback: () => renderWinners() },
  { path: Pages.NOT_FOUND, callback: () => renderNotFound() }
];
createRouter(routes, app);
