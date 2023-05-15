const PAGE_SIZE = 10;
let currentPage = 1;
let pokemons = [];
let filterList = [];

const pokeFilter = async () => {
  try {
    var response = await axios.get("https://pokeapi.co/api/v2/type");
    var pokemon = response.data.results;
    var filter = pokemon
      .map(
        (type, i) =>
          `<div class="filter">
            <input type="checkbox" id="${i}" name="${type.name}" value="${type.name}" class="checkbox">
            <label for="${type.name}" class="label">${type.name}</label>
          </div>`
      )
      .join("");
    $("#filterbuttons").html(filter);
  } catch (error) {
    console.error(error);
  }
};

3;
const pokeCounter = (e, pagePokemon) => {
  $("#counter").empty();
  var startIndex = (currentPage - 1) * PAGE_SIZE;
  var endIndex =
    currentPage * PAGE_SIZE > pagePokemon
      ? pagePokemon
      : currentPage * PAGE_SIZE;

  var currentPokeCount = endIndex - startIndex;

  if (endIndex - startIndex < 1 && pagePokemon == 0) {
    currentPokeCount = 0;
  } else if (endIndex - startIndex < 1) {
    currentPokeCount = 1;
  }

  console.log(currentPokeCount);
  $("#counter").append(`
    <h1>
      Displaying ${currentPokeCount} of ${pagePokemon} Pokemons
    </h1>
  `);
};

const filter = async ({ pokeCategory }) => {
  const filteredPokemon = [];

  for (let i = 0; i < pokemons.length; i++) {
    const pokemon = pokemons[i];
    const res = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${pokemon.name}`
    );
    const pokeTypes = res.data.types.map((type) => type.type.name);
    const filterMatch = pokeCategory.every((typeName) =>
      pokeTypes.includes(typeName)
    );

    if (filterMatch) {
      filteredPokemon.push(pokemon);
    }
  }

  filterList = filteredPokemon;
  paginate(1, PAGE_SIZE, filteredPokemon);
  const numPages = Math.ceil(filteredPokemon.length / PAGE_SIZE);
  updatePaginationDiv(1, numPages);
  pokeCounter(currentPage, filteredPokemon.length);
};

const updatePaginationDiv = (currentPage, numPages) => {
  $("#pagination").empty();

  const startPage = Math.max(currentPage - 2, 1);
  const endPage = Math.min(startPage + 4, numPages);

  for (let i = startPage; i <= endPage; i++) {
    $("#pagination").append(`
    <button class="btn ${
      i === currentPage ? "btn-primary" : "btn-secondary"
    } page ml-1 numberedButtons" value="${i}">${i}</button>
  `);
  }

  if (currentPage < numPages) {
    $("#pagination").append(`
      <button id="nextButton" class="btn btn-primary ml-1" value="${
        currentPage + 1
      }">Next</button>
    `);
  }

  if (currentPage !== 1) {
    $("#pagination").prepend(`
      <button id="previousButton" class="btn btn-primary ml-1" "${
        currentPage - 1
      }">Previous</button>
    `);
  }
};

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  $("#pokeCards").empty();
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url);
    $("#pokeCards").append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#pokeModal">
          More
        </button>
        </div>  
        `);
  });
};

const setup = async () => {
  $("#pokeCards").empty();
  let response = await axios.get(
    "https://pokeapi.co/api/v2/pokemon?offset=0&limit=810"
  );
  pokemons = response.data.results;

  paginate(currentPage, PAGE_SIZE, pokemons);
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
  updatePaginationDiv(currentPage, numPages);
  pokeFilter();
  pokeCounter(currentPage, pokemons.length);

  let pokeCategory = [];

  $("body").on("change", ".checkbox", function (e) {
    pokeCategory = [];
    $(".checkbox:checked").each(function () {
      pokeCategory.push($(this).val());
    });
    filter({ pokeCategory });
  });

  $("body").on("click", ".pokeCard", async function (e) {
    const pokemonName = $(this).attr("pokeName");
    const res = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
    );
    const types = res.data.types.map((type) => type.type.name);
    $(".modal-body").html(`
        <div style="width:200px">
        <img src="${
          res.data.sprites.other["official-artwork"].front_default
        }" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities
          .map((ability) => `<li>${ability.ability.name}</li>`)
          .join("")}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats
          .map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`)
          .join("")}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join("")}
          </ul>
      
        `);
    $(".modal-title").html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `);
  });

  $("body").on("click", ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value);
    paginate(currentPage, PAGE_SIZE, pokemons);

    updatePaginationDiv(currentPage, numPages);
  });

  $("body").on("click", "#nextButton", async function (e) {
    currentPage++;
    paginate(currentPage, PAGE_SIZE, pokemons);

    updatePaginationDiv(currentPage, numPages);
  });

  $("body").on("click", "#previousButton", async function (e) {
    currentPage--;
    paginate(currentPage, PAGE_SIZE, pokemons);

    updatePaginationDiv(currentPage, numPages);
  });
};

$(document).ready(setup);
