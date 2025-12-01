export { }

let allPokemonNames: string[] = [];
let currentPokemonId: number;
let dataCryPokemon: any;
let isShiny = false;
let pkmnData: any;
let currentIndex = -1;
const searchBar = document.getElementById("searchInput") as HTMLInputElement;
const searchButton = document.getElementById("searchButton") as HTMLButtonElement;
const btnPrevious = document.getElementById("btnPrevious") as HTMLButtonElement;
const btnNext = document.getElementById("btnNext") as HTMLButtonElement;
const playCryButton = document.getElementById("playCryButton") as HTMLButtonElement;
const toggleShinyButton = document.getElementById("toggleShiny") as HTMLButtonElement;
const suggestionDiv = document.getElementById("suggestions") as HTMLDivElement;
const showEvolutionBtn = document.getElementById("showEvolutionBtn") as HTMLButtonElement;
const backEvoBtn = document.getElementById("backEvoBtn") as HTMLButtonElement;
const card = document.getElementById("pokemonCard") as HTMLDivElement;
const evoCtn = document.getElementById("evolutionCtn") as HTMLDivElement;
const searchCtn = document.getElementById("searchCtn") as HTMLDivElement;


async function getPokemon(idorName: string | number) {
    try {
        const idorNameComapared = typeof idorName === "number"
            ? idorName
            : idorName.toLowerCase()
        const url = `https://pokeapi.co/api/v2/pokemon/${idorNameComapared}`;
        const response = await fetch(url);
        if (!response.ok) {
            return null;
        }
        const data = await response.json()
        pkmnData = data;
        updateCard(data);

        const card = document.getElementById("pokemonCard") as HTMLDivElement;
        card.style.display = "block";
        return data;
    } catch (error) {
        console.error(error)
        alert("Pokemon not found.")
        return null;
    }
}

async function getPkmnImg(name: string) {
    const url = `https://pokeapi.co/api/v2/pokemon/${name}`;
    const response = await fetch(url);
    const data = await response.json()
    const img = data.sprites.front_default
    const id = data.id
    return { id, img };
}

async function allNames() {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=20000`
    const response = await fetch(url);
    const data = await response.json();
    allPokemonNames = data.results.map((pkmn: any) => pkmn.name);
}


function updateCard(data: any) {
    currentPokemonId = data.id;
    dataCryPokemon = data.cries?.legacy || data.cries?.latest || null;
    const pkmnName = document.getElementById("pkmnName") as HTMLHeadingElement;
    const pkmnId = document.getElementById("pkmnId") as HTMLParagraphElement;
    const pkmnImage = document.getElementById("pkmnImage") as HTMLImageElement;
    const pkmnTypes = document.getElementById("pkmnTypes") as HTMLDivElement;
    const pkmnHeight = document.getElementById("pkmnHeight") as HTMLParagraphElement;
    const pkmnWeight = document.getElementById("pkmnWeight") as HTMLParagraphElement;
    const pkmnAbility = document.getElementById("pkmnAbility") as HTMLSpanElement;

    pkmnName.textContent = data.name.charAt(0).toUpperCase() + data.name.slice(1);
    pkmnId.textContent = `#${data.id}`;
    pkmnImage.src = data.sprites.front_default;
    pkmnTypes.innerHTML = "";
    const types = data.types;
    const card = document.getElementById("pokemonCard") as HTMLDivElement;
    card.classList.remove("fade");
    void card.offsetWidth;
    card.classList.add("fade");
    card.classList.remove("type-fire", "type-water", "type-grass",
        "type-electric", "type-psychic", "type-ice", "type-dragon",
        "type-dark", "type-fairy", "type-normal", "type-fighting",
        "type-flying", "type-poison", "type-ground", "type-rock",
        "type-bug", "type-ghost", "type-steel");
    card.classList.add(`type-${types[0].type.name}`)
    types.forEach((typeInfo: any) => {
        const typeName = typeInfo.type.name;
        const badge = document.createElement("span") as HTMLSpanElement;
        badge.textContent = typeName;
        badge.className = `type-badge type-${typeName}`;
        pkmnTypes.appendChild(badge);
    })

    pkmnHeight.textContent = `Height: ${data.height / 10} m`;
    pkmnWeight.textContent = `Weight: ${data.weight / 10} kg`;
    const dataAbilities = data.abilities.map((abilityInfo: any) => abilityInfo.ability.name.charAt(0).toUpperCase() +
        abilityInfo.ability.name.slice(1));
    pkmnAbility.textContent = dataAbilities.join(", ")

};

function updateActive(items: HTMLElement[]) {
    items.forEach(item => item.classList.remove("active"));

    if (currentIndex >= 0 && currentIndex < items.length) {
        items[currentIndex].classList.add("active");
    }
};

async function getEvo(dataPkmn: any) {
    const evolutionCtn = document.getElementById("evolutionCtn") as HTMLDivElement;
    evolutionCtn.style.display = "flex"
    const urlSpecies = dataPkmn.species.url
    const speciesEvoRes = await ((await fetch(urlSpecies)).json())
    const evoChainUrl = speciesEvoRes.evolution_chain.url
    const evoChainRes = await ((await fetch(evoChainUrl)).json())
    const evoList: any[] = []
    let currentData = evoChainRes.chain

    async function processEvo(dataChain: any) {
        const cName = dataChain.species.name.charAt(0).toUpperCase() + dataChain.species.name.slice(1)
        const dataPkmnImg = await getPkmnImg(cName);
        evoList.push({
            name: cName,
            id: dataPkmnImg.id,
            img: dataPkmnImg.img
        })
        if (dataChain.evolves_to.length > 0) {
            for (const evo of dataChain.evolves_to) {
                await processEvo(evo)
            }
        }
    }
    await processEvo(currentData);
    evoCard(evoList)
}



function evoCard(data: any[] = []) {
    data.forEach((pkmn: any) => {
        const divEvoCtn = document.getElementById("evolutionCtn") as HTMLDivElement;
        const divEvo = document.createElement("div") as HTMLDivElement
        divEvo.className = "card";
        const h2 = document.createElement("h2") as HTMLHeadingElement;
        h2.textContent = pkmn.name;
        const pTag = document.createElement("p") as HTMLParagraphElement
        pTag.textContent = `#${pkmn.id}`
        const img = document.createElement("img") as HTMLImageElement;
        img.src = pkmn.img;
        divEvoCtn.appendChild(divEvo);
        divEvo.appendChild(h2)
        divEvo.appendChild(pTag)
        divEvo.appendChild(img);
    })
}

searchBar.addEventListener("input", () => {
    const input = searchBar.value.toLowerCase();

    if (input === "") {
        suggestionDiv.innerHTML = "";
        return;
    }
    const suggestions = allPokemonNames.filter(name => name.startsWith(input));
    // console.log(suggestions)
    suggestionDiv.innerHTML = "";
    suggestions.slice(0, 10).forEach(name => {
        const suggestionItem = document.createElement("div");
        suggestionItem.textContent = name;
        suggestionItem.className = "suggestion-item";
        suggestionItem.onclick = () => {
            searchBar.value = name;
            suggestionDiv.innerHTML = "";
            searchButton.click()
        }
        suggestionDiv.appendChild(suggestionItem);
        // console.log(suggestionDiv)
    })
})

searchButton.addEventListener("click", async () => {
    if (searchBar.value === "") {
        alert("Por favor ingresa el nombre de un Pokemon");
        return;
    }
    await getPokemon(searchBar.value.trim().toLowerCase())
});

btnPrevious.addEventListener("click", async () => {
    if (currentPokemonId > 1) {
        await getPokemon(currentPokemonId - 1)
    }
});

btnNext.addEventListener("click", async () => {
    await getPokemon(currentPokemonId + 1)
})

toggleShinyButton.addEventListener("click", async () => {
    const pkmnImage = document.getElementById("pkmnImage") as HTMLImageElement;
    pkmnImage.classList.remove("fade");
    void pkmnImage.offsetWidth;
    pkmnImage.classList.add("fade");
    isShiny = !isShiny;
    pkmnImage.src = isShiny
        ? pkmnData.sprites.front_shiny
        : pkmnData.sprites.front_default;

})

document.addEventListener("keydown", event => {
    const items = suggestionDiv.getElementsByClassName("suggestion-item") as HTMLCollectionOf<HTMLElement>;
    if (event.key === "ArrowDown") {
        if (currentIndex < items.length - 1) {
            currentIndex++;
            updateActive(Array.from(items));
        }
    }
    if (event.key === "ArrowUp") {
        if (currentIndex > 0) {
            currentIndex--;
            updateActive(Array.from(items));
        }
    }
    if (event.key === "ArrowLeft") {
        btnPrevious.click();
    }
    if (event.key == "ArrowRight") {
        btnNext.click();
    }

    if (event.key == "Enter") {
        searchButton.click()
    }
})

playCryButton.onclick = async () => {
    const audio = document.getElementById("pkmnCry") as HTMLAudioElement;
    audio.volume = 0.3;
    audio.src = `${dataCryPokemon}`
    audio.play();
}


showEvolutionBtn.addEventListener("click", () => {
    card.style.display = "none";
    searchCtn.style.display = "none";
    backEvoBtn.style.display = "block"
    getEvo(pkmnData)
})

backEvoBtn.addEventListener("click", () => {
    console.log("Clicked")
    evoCtn.innerHTML = "";
    searchCtn.style.display = "block"
    card.style.display = "block";
    evoCtn.style.display = "none";
    backEvoBtn.style.display = "none"

})

// Inicialization
allNames()