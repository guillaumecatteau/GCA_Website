fetch("projects.json")
  .then(response => response.json())
  .then(projects => {
    const container = document.getElementById("gallery");
    projects.forEach(project => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <button onclick="alert('No project link available for: ${project.title}')">View Project</button>
      `;
      container.appendChild(card);
    });
  });
