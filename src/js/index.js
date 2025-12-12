document.getElementById("btn-search").addEventListener("click", () => {
  const userName = document.getElementById("input-search").value;
  if (userName.length === 0) {
    alert('Preencha o campo com o nome do usuário do GitHub')
    return
  }
  getUserProfile(userName);
});

document.getElementById("input-search").addEventListener("keyup", (e) => {
  const userName = e.target.value;
  const key = e.which || e.keyCode;
  const isEnterKeyPressed = key === 13;

  if (isEnterKeyPressed) {
    if (userName.length === 0) {
    alert('Preencha o campo com o nome do usuário do GitHub')
    return
  }
    getUserProfile(userName);
  }
});

async function user(userName) {
  const response = await fetch(`https://api.github.com/users/${userName}`);
  return await response.json();
}

async function repos(userName) {
  const response = await fetch(
    `https://api.github.com/users/${userName}/repos?per_page=10`
  );
  return await response.json();
}

function getUserProfile(userName) {
  user(userName).then((userData) => {
    let userInfo = `<div class="info">
        <img src="${
          userData.avatar_url
        }" alt="Foto do perfil do usuário" />
                            <div class="data">
                                <h1>${
                                  userData.name ?? "Não possui nome cadastrado"
                                }</h1>
                                <p>${
                                  userData.bio ?? "Não possui bio cadastrada"
                                }</p>
                            </div>
                            <div class="follow">
                                <p>👥 Seguidores: ${userData.followers}</p>
                                <p>👥 Seguindo: ${userData.following}</p>
                            </div>
                            </div>`;
    document.querySelector(".profile-data").innerHTML = userInfo;

    getUserRepositories(userName);
    getUserEvents(userName);
  });
}

function getUserRepositories(userName) {
  repos(userName).then((reposData) => {
    let repositoriesItens = "";

    reposData.forEach(repo => {
      repositoriesItens += `<li>
                                <a href="${repo.html_url}" target="_blank">
                                    <h3>${repo.name}</h3>
                                    <ul>
                                        <li>🍴 ${repo.forks_count}</li>
                                        <li>⭐ ${repo.stargazers_count}</li>
                                        <li>👀 ${repo.watchers_count}</li>
                                        <li>👨‍💻 ${repo.language ?? 'Linguagem não definida'}</li>
                                    </ul>
                                </a>
                            </li>`
    });
    document.querySelector(".profile-data").innerHTML += `<div class="repositories section">
        <h2>Repositórios</h2>
        <ul>${repositoriesItens}</ul>
        </div>`;
  });
}

async function events(userName) {
  const response = await fetch(`https://api.github.com/users/${userName}/events`)
  return await response.json();
}

function getUserEvents(userName) {
  events(userName).then((eventsData) => {
    let eventsItens = "";

    // 1. Filtra os eventos pelos tipos desejados
    const filteredAndSortedEvents = eventsData.filter(event => 
        event.type === "PushEvent" || event.type === "CreateEvent"
    );

    // 2. Limita a exibição aos 10 primeiros eventos
    const latest10Events = filteredAndSortedEvents.slice(0, 10);

    latest10Events.forEach(event => {
      if(event.payload.commits) {
        eventsItens += `<li><strong>${event.repo.name}</strong> - ${event.payload.commits[0].message}</li>`
      } else {
        eventsItens += `<li><strong>${event.repo.name}</strong> - sem mensagem de commit</li>`
      }
    })

    document.querySelector(".profile-data").innerHTML += `<div class="events section">
    <h2>Eventos</h2>
    <ul>${eventsItens}</ul>
    </div>`
  })
}