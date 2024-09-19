const urls = [
  "http://localhost:3000/teams",
  "http://localhost:3000/scoreboard",
];

Promise.all(
  urls.map((url) =>
    fetch(url).then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok for " + url);
      }
      return response.json();
    })
  )
)
  .then(([teamsData, scoreboardData]) => {
    const groupedByTeam = scoreboardData.reduce((accumulator, member) => {
      const item = member;
      item.score =
        member.kills * 100 + member.revives * 75 + member.assists * 50;

      if (member.team in accumulator) accumulator[member.team].push(item);
      else accumulator[member.team] = [item];
      return accumulator;
    }, {});

    const groupedByTeamSorted = {},
      groupedByTeamTotalScore = {};
    let winner = { score: 0, id: "", name: "" };
    Object.keys(groupedByTeam).forEach((key) => {
      groupedByTeamSorted[key] = groupedByTeam[key].sort(
        (a, b) => b.score - a.score
      );
      groupedByTeamTotalScore[key] = groupedByTeam[key].reduce(
        (sum, item) => sum + item.score,
        0
      );

      if (winner.score < groupedByTeamTotalScore[key]) {
        winner = { score: groupedByTeamTotalScore[key], id: key };
      }
    });
    const teamsElement = document.querySelector(".teams");

    teamsData.forEach((team) => {
      const teamElement = document.createElement("div");
      teamElement.classList.add("team");
      const teamHeaderElement = document.createElement("h3");
      teamHeaderElement.innerHTML = team.name;
      teamElement.appendChild(teamHeaderElement);
      const teamTableElement = document.createElement("table");
      const teamTableHeadElement = document.createElement("thead");
      const teamTableBodyElement = document.createElement("tbody");
      const teamTableHeadRowElement = document.createElement("tr");
      if (winner.id === team.id) winner.name = team.name;

      const headerTitles = [
        "Rank",
        "Name",
        "Kills",
        "Assists",
        "Revives",
        "Deaths",
        "Score",
      ];
      headerTitles.forEach((title) => {
        const teamTableHeadCellElement = document.createElement("th");
        teamTableHeadCellElement.innerHTML = title;
        teamTableHeadRowElement.appendChild(teamTableHeadCellElement);
      });

      groupedByTeamSorted[team.id].forEach((rawItem, index) => {
        const teamTableBodyRowElement = document.createElement("tr");
        const item = {
          ...rawItem,
          rank: !index
            ? "🥇"
            : index === 1
            ? "🥈"
            : index === 2
            ? "🥉"
            : `${index + 1}`,
        };

        headerTitles.forEach((key) => {
          const teamTableBodyCellElement = document.createElement("td");
          teamTableBodyCellElement.innerHTML = item[key.toLowerCase()];
          teamTableBodyRowElement.appendChild(teamTableBodyCellElement);
        });

        teamTableBodyElement.appendChild(teamTableBodyRowElement);
      });

      teamTableHeadElement.appendChild(teamTableHeadRowElement);
      teamTableElement.appendChild(teamTableHeadElement);
      teamTableElement.appendChild(teamTableBodyElement);
      teamElement.appendChild(teamTableElement);
      teamsElement.appendChild(teamElement);
    });

    const statusElement = document.querySelector(".status");
    statusElement.innerHTML = `${winner.name} Has the Upper Hand!`;
  })
  .catch((error) => {
    console.error("One or more fetch operations failed:", error);
  });
