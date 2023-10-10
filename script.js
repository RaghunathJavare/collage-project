'use strict';

class Place {
  // date = new Date();
  // id = (Date.now() + '').slice(-10);

  constructor(coords, placeName) {
    this.coords = coords;
    this.placeName = placeName;
  }
}

const searchBox = document.querySelector('.search__contaienr');
const form = document.querySelector('.search');
const inputPlace = document.querySelector('.input__place');

class App {
  #map;
  #mapZoomLevel = 12;
  #mapEvent;
  #workouts = [];

  constructor() {
    // Get user's position
    this._getPosition();
    this._getLocalStorage();

    // Get data from local storage

    // Attach event handlers
    form.addEventListener('submit', this._place.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    searchBox.classList.remove('hidden');
    inputPlace.focus();
  }

  _hideForm() {
    searchBox.classList.add('hidden');
    inputPlace.value = '';
  }

  _place(e) {
    e.preventDefault();

    //Get input from user
    const placeName = inputPlace.value;

    console.log(placeName);
    const { lat, lng } = this.#mapEvent.latlng;

    const workout = new Place([lat, lng], placeName);

    // // Add new object to workout array
    this.#workouts.push(workout);

    // // Render workout on map as marker
    this._renderWorkoutMarker(workout);

    // // Hide form + clear input fields
    this._hideForm();

    // // Set local storage to all Places
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 10,
          autoClose: false,
          closeOnClick: false,
        })
      )
      .setPopupContent(`<h6>${workout.placeName}</h6>`)
      .openPopup();
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach(work => {
      this._place(work)
    });
  }
}

const app = new App();
