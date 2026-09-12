#!/usr/bin/env node

/**
 * Script para agregar automáticamente todos los issues abiertos al Project Board en GitHub
 * 
 * Uso:
 *   GITHUB_TOKEN=ghp_xxxx node scripts/add-issues-to-project.mjs
 */

const REPO_OWNER = process.env.REPO_OWNER || 'Gerster7';
const REPO_NAME = process.env.REPO_NAME || 'rut.ar';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('\x1b[31mError: Variable de entorno GITHUB_TOKEN no encontrada.\x1b[0m');
  process.exit(1);
}

async function graphql(query, variables = {}) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });
  const data = await res.json();
  if (data.errors && data.errors.length > 0 && !data.data) {
    throw new Error(JSON.stringify(data.errors));
  }
  return data;
}

async function main() {
  console.log(`\x1b[34m🔍 Buscando tableros de Projects para ${REPO_OWNER} y ${REPO_OWNER}/${REPO_NAME}...\x1b[0m`);

  const findProjectsQuery = `
    query($owner: String!, $repo: String!) {
      user(login: $owner) {
        projectsV2(first: 10) {
          nodes {
            id
            title
            number
            url
          }
        }
      }
      repository(owner: $owner, name: $repo) {
        id
        projectsV2(first: 10) {
          nodes {
            id
            title
            number
            url
          }
        }
        issues(first: 50, states: OPEN) {
          nodes {
            id
            number
            title
          }
        }
      }
    }
  `;

  const result = await graphql(findProjectsQuery, { owner: REPO_OWNER, repo: REPO_NAME });

  const userProjects = result.data?.user?.projectsV2?.nodes?.filter(Boolean) || [];
  const repoProjects = result.data?.repository?.projectsV2?.nodes?.filter(Boolean) || [];
  const allProjects = [...repoProjects, ...userProjects];

  if (allProjects.length === 0) {
    console.error('\x1b[31m❌ No se encontró ningún Project (v2) en el usuario o repositorio.\x1b[0m');
    console.log('Verifica que el token tenga permisos de "project" o crea uno en https://github.com/users/' + REPO_OWNER + '/projects');
    return;
  }

  // Tomamos el primer proyecto encontrado o el más reciente
  const targetProject = allProjects[0];
  console.log(`\x1b[32m✅ Tablero detectado: "${targetProject.title}" (ID: ${targetProject.id})\x1b[0m`);
  console.log(`   URL: ${targetProject.url}\n`);

  const issues = result.data?.repository?.issues?.nodes || [];
  console.log(`📋 Se encontraron ${issues.length} issues abiertos en el repositorio.`);

  const addMutation = `
    mutation($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
        item {
          id
        }
      }
    }
  `;

  for (const issue of issues) {
    process.stdout.write(`➕ Agregando Issue #${issue.number}: "${issue.title.slice(0, 45)}..." `);
    try {
      await graphql(addMutation, { projectId: targetProject.id, contentId: issue.id });
      console.log('\x1b[32m[OK]\x1b[0m');
    } catch (err) {
      console.log(`\x1b[33m[Ya existe o error]\x1b[0m`);
    }
    await new Promise(r => setTimeout(r, 600));
  }

  console.log(`\n\x1b[32m🎉 ¡Todos los issues fueron vinculados a tu tablero!\x1b[0m`);
  console.log(`👉 Miralo en: ${targetProject.url}`);
}

main().catch(err => {
  console.error('\x1b[31m❌ Error ejecutando script:\x1b[0m', err.message);
});
