import axios from 'axios';
import Notiflix from 'notiflix';
import 'simplelightbox/dist/simple-lightbox.min.css';
import _default from '../node_modules/simplelightbox/dist/simple-lightbox.js';

const input = document.querySelector('.input');
const searchBtn = document.querySelector('.search-btn');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-btn');
const lightbox = () => new SimpleLightbox('.gallery a', {});

let page = 1;
const perPage = 40;
const clear = element => {
  [...element.children].forEach(child => child.remove());
};

loadBtn.style.display = 'none';

const fetchImages = async () => {
  try {
    const response = await axios(
      `https://pixabay.com/api/?key=25107796-9974ea960b32f02e8ca5a894d&q=${input.value}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`,
    );
    const rest = response.data.totalHits + perPage - page * perPage;
    if (response.data.totalHits === 0 || input.value === '') {
      throw new Error('Error');
    } else if (response.data.totalHits <= perPage && response.data.totalHits !== 0) {
      loadBtn.style.display = 'none';
      Notiflix.Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
    } else {
      if (rest > perPage) {
        Notiflix.Notify.success(`Hooray! We found ${rest} images.`);
        loadBtn.style.display = 'block';
      }
      if (rest <= perPage) {
        loadBtn.style.display = 'none';
        Notiflix.Notify.success(`Hooray! We found ${rest} images.`);
        Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
      }
    }
    console.log(response);
    return response;
  } catch {
    error => console.log(error.message);
  }
};

const makeImages = record => {
  const markup = `<div class="photo-card">
  <a class="photo-link" href="${record.largeImageURL}"><img class="photo" src="${record.webformatURL}" alt="${record.tags}" loading="lazy" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b> <br>${record.likes}</br>
    </p>
    <p class="info-item">
      <b>Views</b> <br>${record.views}</br>
    </p>
    <p class="info-item">
      <b>Comments</b> <br>${record.comments}</br>
    </p>
    <p class="info-item">
      <b>Downloads</b> <br>${record.downloads}</br>
    </p>
  </div>
</div>`;
  gallery.insertAdjacentHTML('beforeend', markup);
};

const makeRequest = e => {
  e.preventDefault();
  clear(gallery);
  fetchImages()
    .then(data => {
      data.data.hits.forEach(record => makeImages(record));
    })
    .catch(error => {
      loadBtn.style.display = 'none';
      return Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.',
      );
    });
};

const loadMore = e => {
  e.preventDefault();
  page += 1;
  fetchImages()
    .then(data => data.data.hits.forEach(record => makeImages(record)))
    .catch(error => console.log(error.message));
};

const loadLightbox = e => {
  e.preventDefault();
  lightbox();
};

searchBtn.addEventListener('click', makeRequest);
loadBtn.addEventListener('click', loadMore);
gallery.addEventListener('click', loadLightbox);
