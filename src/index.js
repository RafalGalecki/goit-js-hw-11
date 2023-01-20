'use strict';

import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('.search-form__input');
const searchBtn = document.querySelector('.search-form__btn');
const loadMoreBtn = document.querySelector('.load-more');
const galleryContainer = document.querySelector('.gallery');

const infoLabels = ['Likes', 'Views', 'Comments'];

let q;
let page = 1;
let per_page = 40;

// data.config.params.
// let myParams = {
//   key: '32900426-a12efdc1668c6b000f20a1416',
//   q,
//   image_type: 'photo',
//   orientation: 'horizontal',
//   safesearch: true,
//   page,
//   per_page,
// };

let whichTurn = 1;

let webformatURL;
let largeImageURL;
let tags;
let likes;
let views;
let comments;
let downloads;
//let totalHits;

//const lightbox1 = $('.lighbox-1 a').simpleLightbox();

// data.hits.webformatURL;
// data.hits.largeImageURL;
// data.hits.tags;
// data.hits.likes;
// data.hits.views;
// data.hits.comments;
// data.hits.downloads;
// data.totalHits;

searchForm.addEventListener('submit', handleSubmit);
//loadMoreBtn.addEventListener('click', loadMore);

function handleSubmit(event) {
  event.preventDefault();
  getKeyWords();
  refreshRendering();
  fetchPhotos();
}

// function loadMore(totalHits) {
//   let totalPages = totalHits / per_page;
//   if (page < totalPages) {
//     console.log('Which page for load more is:', page);
//     fetchPhotos();
//   }
// }

function getKeyWords() {
  Array.from(searchForm.elements).forEach(el => {
    if (el.name === 'searchQuery') {
      let keyWords = el.value.trim().replaceAll(' ', '+');
      q = keyWords;
      console.log('q is', q);
      //console.log('Czy jest q w obiekcie:', myParams);
    }
  });
}
// MAIN ASYNC/AWAIT FETCH FUNCTION using AXIOS
async function fetchPhotos() {
    
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: '32900426-a12efdc1668c6b000f20a1416',
        q,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page,
        per_page,
      },
    });
    successAlert(page, response.data.totalHits);
    page += 1;
    
    console.log('page po dodaniu:', typeof page, page);
    //loadMore(response.data.totalHits);
    noPhotosMatching(response.data.totalHits);
    allPagesLoaded(response.data.totalHits);
    renderSinglePhotoCard(response.data);

    console.log('full response --------', response);
  } catch (error) {
    console.error(error);
  }
}

// it appears when there is no matching photos 
function noPhotosMatching(matching) {
  if (matching === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}


//render photo card for each photo fetched
// and start simpleLightbox gallery
function renderSinglePhotoCard(data) {

  data.hits.forEach(el => {
    const photoCardDiv = document.createElement('div');
    photoCardDiv.classList.add('photo-card');
    photoCardDiv.classList.add('gallery__item');
    galleryContainer.appendChild(photoCardDiv);

    const photoLarge = document.createElement('a');
    photoLarge.setAttribute('href', el.largeImageURL);
    photoLarge.classList.add('gallery__link');
    photoCardDiv.appendChild(photoLarge);

    const photoImg = document.createElement('img');
    photoImg.setAttribute('src', el.webformatURL);
    photoImg.setAttribute('alt', el.tags);
    photoImg.setAttribute('loading', 'lazy');
    photoImg.classList.add('gallery__image');
    photoLarge.appendChild(photoImg);

    const infoDiv = document.createElement('div');
    infoDiv.classList.add('info');
    photoCardDiv.appendChild(infoDiv);

    renderInfos(el, infoDiv);
  });
  const gallery = new SimpleLightbox('.gallery a', {
    captionDelay: 2500,
  });
}

//render some features of each photo beneath of it
function renderInfos(data, element) {
  let infoData = {
    Likes: data.likes,
    Views: data.views,
    Comments: data.comments,
    Downloads: data.downloads,
  };
  const keys = Object.keys(infoData);
  
  for (const info of keys) {
    const infoParagraph = document.createElement('p');
    infoParagraph.classList.add('info-item');
    element.appendChild(infoParagraph);

    const infoLabel = document.createElement('b');
    infoLabel.textContent = `${info}`;
    infoParagraph.appendChild(infoLabel);

    const infoValue = document.createElement('span');
    infoValue.textContent = infoData[info].toLocaleString('pl-PL');
    infoParagraph.appendChild(infoValue);
  }
}

// refreshing rendered photos
// This function remove gallery items
function refreshRendering() {
  elementToRemove = document.querySelectorAll('.gallery__item');

  if (elementToRemove.length > 1) {
    for (let i = 0; i < elementToRemove.length; i++) {
      elementToRemove[i].remove();
    }
  }
}
// it appears on the last page of totalHits
// and hide the loadMore button
function allPagesLoaded(totalHits) {
  let totalPages = totalHits / per_page;
  if (page > totalPages) {
    loadMoreBtn.classList.add('hidden');
    Notiflix.Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
  }
}
// it appears on first submit of new keyWords only
function successAlert(page, totalHits) {
  if (page === 1) {
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images`);
  }
}
