// const { title } = require('process');

// import 'core-js/stable';
// import 'regenerator-runtime/runtime';
import { MODAL_CLOSE_SEC } from './config.js';
import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarkesView from './views/bookmarkesView.js';
import addRecipeView from './views/addRecipeView.js';

// https://forkify-api.herokuapp.com/v2
///////////////////////////////////////

const controlRecipes = async function () {
  try {
    // # Verify and store recipeID
    const recipeID = this.document.location.hash.slice(1);
    if (!recipeID) return;

    // # Spinner
    recipeView.renderSpinner();

    // #0 Update results view to mark selected search result
    resultsView.update(model.getSearchRestultsPage());

    // #1 Update bookmarks view
    bookmarkesView.update(model.state.bookmarks);

    // #2 Loading recipe
    await model.loadRecipe(recipeID);

    // #3 Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    // recipeView.renderError(err);
  }
};

const controlSearchResults = async function () {
  try {
    // # Spinner
    resultsView.renderSpinner();
    // console.log(resultsView);

    // #1 Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // #2 Load search results
    await model.loadSearchResults(query);

    // #3 Render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchRestultsPage());

    // // #4 Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    resultsView.renderError();
  }
};

const controlPagination = function (goToPage) {
  // #1 Render NEW results
  // resultsView.render(model.getSearchRestultsPage(model.state.search.page));
  resultsView.render(model.getSearchRestultsPage(goToPage));

  // #2 Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateService(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // #1 Add/remove bookmark
  !model.state.recipe.bookmarked
    ? model.addBookmark(model.state.recipe)
    : model.removeBookmark(model.state.recipe.id);

  // #2 Update recipe view
  recipeView.update(model.state.recipe);

  // #3 Render bookmarks
  bookmarkesView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarkesView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarkesView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    // console.error(err);
    addRecipeView.renderError(err.message);
  }
};

const newFeature = function () {
  console.log('Welcome to the application');
};

const init = function () {
  bookmarkesView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerRenderUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  newFeature();
};
init();

// console.log(model);
