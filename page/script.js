const githubApiToken = ""; // Github Personal Access Token, Please replace with your own

class input {
  constructor(id, className, placeholder, label, isInline = false, onChange = null) {
    this.div = document.createElement("div");
    this.div.style.margin = "1em 0";
    this.div.style.display = "flex";
    this.div.style.flexDirection = "column";
    this.div.style.fontSize = "2em";
    this.div.className = `nes-field${isInline ? " is-inline" : ""}`;
    this.label = document.createElement("label");
    this.label.htmlFor = id;
    this.label.textContent = label;
    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.placeholder = placeholder;
    this.input.className = className;
    this.input.id = id;
    this.input.autocomplete = "off";
    this.input.autofocus = true;
    this.input.addEventListener("input", async (e) => {
      const username = e.target.value;
      onChange.forEach((func) => {
        func(username);
      });
    });
    this.div.appendChild(this.label);
    this.div.appendChild(this.input);
  }
  divElement() {
    return this.div;
  }
}

class Badge {
  constructor(text, className) {
    this.badgePlate = document.createElement("div");
    this.badgePlate.className = "nes-badge";
    this.badgePlate.style.margin = "2em";
    this.badge = document.createElement("span");
    this.badge.className = `nes-badge ${className}`;
    this.badge.textContent = text;
    this.badge.style.fontSize = "1em";
    this.badge.style.position = "relative";
    this.badgePlate.appendChild(this.badge);
  }
  render() {
    return this.badgePlate;
  }
}

class Repo {
  constructor(data) {
    this.data = data;
    console.log(data);
  }
  render() {
    const repo = document.createElement("div");
    repo.className = "nes-container is-rounded is-centered repo";
    const h2 = document.createElement("h2");
    h2.textContent = "Latest Repos";
    repo.appendChild(h2);
    this.data.forEach((repoItem) => {
      const repoContainer = document.createElement("div");
      repoContainer.className = "repo-container";
      repo.appendChild(repoContainer);

      const repoName = document.createElement("a");
      repoName.style.fontSize = "2em";
      repoName.style.position = "relative";
      repoName.style.top = "0.6em";
      repoName.style.margin = "0 2em";
      repoName.href = repoItem.html_url;
      repoName.textContent = repoItem.name;
      repoName.target = "_blank";
      repoContainer.appendChild(repoName);

      const badges = [
        new Badge(`Stars ${repoItem.stargazers_count}`, "is-primary"),
        new Badge(`Watchers ${repoItem.watchers_count}`, "is-warning"),
        new Badge(`Forks ${repoItem.forks_count}`, "is-success"),
      ];

      badges.forEach((badge) => {
        repoContainer.appendChild(badge.render());
      });
    });
    console.log(repo);
    return repo;
  }
}

class User {
  constructor(data) {
    this.data = data;
    console.log(data);
  }
  render() {
    const user = document.createElement("div");
    user.className = "nes-container is-rounded user";

    const imgContainer = document.createElement("div");
    imgContainer.className = "nes-container is-rounded";
    user.appendChild(imgContainer);

    const img = document.createElement("img");
    img.className = "avatar";
    img.height = "200";
    img.src = this.data.avatar_url;
    img.alt = this.data.login;
    imgContainer.appendChild(img);

    const info = document.createElement("div");
    info.className = "info";
    user.appendChild(info);

    const chips = document.createElement("div");
    chips.style.display = "block";
    chips.className = "chips";
    info.appendChild(chips);

    const badges = [
      new Badge(`Public Repos ${this.data.public_repos}`, "is-primary"),
      new Badge(`Public Gists ${this.data.public_gists}`, "is-dark"),
      new Badge(`Followers ${this.data.followers}`, "is-success"),
      new Badge(`Following ${this.data.following}`, "is-warning"),
    ];

    badges.forEach((badge) => {
      chips.appendChild(badge.render());
    });

    const h3 = document.createElement("h3");
    h3.textContent = this.data.login;
    info.appendChild(h3);
    imgContainer.appendChild(h3);

    const profileLink = document.createElement("button");
    profileLink.className = "nes-btn is-primary";
    profileLink.textContent = "View Profile";
    profileLink.style.margin = "1em 0";
    profileLink.onclick = () => {
      window.open(this.data.html_url);
    };
    imgContainer.appendChild(profileLink);

    const company = document.createElement("p");
    company.textContent = `Company: ${this.data.company}`;
    info.appendChild(company);

    const blog = document.createElement("p");
    blog.textContent = `Website / Blog: ${this.data.blog}`;
    info.appendChild(blog);

    const location = document.createElement("p");
    location.textContent = `Location: ${this.data.location}`;
    info.appendChild(location);

    const memberSince = document.createElement("p");
    memberSince.textContent = `Member Since: ${new Date(this.data.created_at).toDateString()}`;
    info.appendChild(memberSince);

    const bio = document.createElement("p");
    bio.textContent = `${this.data.bio === null ? "" : this.data.bio}`;
    imgContainer.appendChild(bio);
    return user;
  }
}

const errorMessage = (message) => {
  userContainer.innerHTML = "";
  repoContainer.innerHTML = "";
  const error = document.createElement("div");
  error.className = "nes-container is-rounded error";
  error.style.backgroundColor = "#ff0000";
  error.textContent = message;
  error.style.fontSize = "2em";
  error.style.color = "#fff";
  userContainer.appendChild(error);
};

const fetchGithubUser = async (username) => {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${githubApiToken}`,
      },
    });

    if (username === "" || username === null) {
      errorMessage("Please enter a username :)");
      return;
    } else {
      userContainer.innerHTML = "";
    }

    if (response.status === 404) {
      errorMessage("User Not Found :(");
      throw new Error("User Not Found");
    }

    if (response.status === 403) {
      errorMessage("Rate limit exceeded. Please try again later :(");
      throw new Error("Rate limit exceeded. Please try again later");
    }

    const data = await response.json();
    findUser = new User(data);
    userContainer.innerHTML = "";
    userContainer.appendChild(findUser.render());
  } catch (error) {
    console.error(error);
  }
};

const fetchGithubUsersRepository = async (username) => {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=3&sort=created&desc`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${githubApiToken}`,
      },
    });

    if (username === "" || username === null) {
      return;
    } else {
      repoContainer.innerHTML = "";
    }

    const data = await response.json();
    findRepos = new Repo(data);
    repoContainer.innerHTML = "";
    repoContainer.appendChild(findRepos.render());
  } catch (error) {
    console.error(error);
  }
};

const mainContainer = document.querySelector(".main-container");
const userContainer = document.createElement("div");
const repoContainer = document.createElement("div");
const header = document.createElement("header");
const h1 = document.createElement("h1");
const h2 = document.createElement("h2");
mainContainer.appendChild(header);
h1.textContent = "Search Github Users";
h1.style.fontSize = "5em";
h2.textContent = "Enter a username to fetch a user profile and repos";
h2.style.fontSize = "2em";
header.appendChild(h1);
header.appendChild(h2);
const inputElement = new input("githubUserName", "search nes-input", "Enter Github Username", "Github Username", true, [fetchGithubUser, fetchGithubUsersRepository]);
mainContainer.appendChild(inputElement.divElement());
mainContainer.appendChild(userContainer);
mainContainer.appendChild(repoContainer);
let findUser = new User({});
errorMessage("Please enter a username :)");
userContainer.style.margin = "1em 0";
repoContainer.style.margin = "1em 0";
