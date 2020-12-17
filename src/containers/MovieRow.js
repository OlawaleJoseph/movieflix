/* eslint-disable consistent-return */
/* eslint-disable camelcase */
import { Grid, makeStyles } from '@material-ui/core';
import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import movieTrailer from 'movie-trailer';
import Youtube from 'react-youtube';
import PropTypes from 'prop-types';
import MovieCard from '../components/MovieCard';
import Filter from '../components/Filter';
import fetch from '../helpers/data';
import { imageBaseUrl } from '../helpers/constants';
import { filterMovies } from '../helpers/common';
import filterAction from '../actions/filter';

const useStyles = makeStyles(theme => ({
  itemRoot: {
    padding: '0 !important',
  },
  container: {
    flexWrap: 'nowrap',
    'overflow-x': 'scroll',
    padding: theme.spacing(2, 0),
  },
  heading: {
    padding: '15px 0',
  },
}));
function MovieRow({
  title, moviesUrl, filterParam, moviesFilter, id, allGenres,
}) {
  const classes = useStyles();
  const [movies, setMovies] = useState(null);
  const parentSectionId = useRef('');
  const [genres, setGenres] = useState([]);
  const [trailerUrl, setTrailerUrl] = useState('');
  useEffect(async () => {
    const fetchMovies = async () => {
      const { data: { results } } = await fetch.get(moviesUrl);

      return results.map(({
        id, poster_path, genre_ids, title, name,
      }) => ({
        id,
        imageUrl: imageBaseUrl + poster_path,
        genreIds: genre_ids,
        name: title || name,
      }));
    };
    try {
      const data = await fetchMovies();
      setMovies(data);
      const flattedGenresArr = data.map(({ genreIds }) => (genreIds)).flat();
      const uniqGenres = new Set(flattedGenresArr);
      setGenres([...uniqGenres]);
    } catch (error) {
      console.log('Error occurred');
      console.log(error);
    }
  }, []);

  const setMoviesToDisplay = () => {
    if (parentSectionId.current === id) {
      return filterMovies(movies, filterParam);
    }
    return movies;
  };

  const handleFilter = e => {
    const section = e.target.closest('section');
    if (id === section.id) {
      moviesFilter(e.target.value);
      parentSectionId.current = section.id;
    }
  };

  const handleTrailerClick = async name => {
    if (trailerUrl) {
      setTrailerUrl('');
    } else {
      try {
        const url = await movieTrailer(name || '');
        const urlParams = new URLSearchParams(new URL(url).search);
        setTrailerUrl(urlParams.get('v'));
      } catch (error) {
        console.log('Url Error', error);
      }
    }
  };

  const youtubeOptions = {
    height: '390',
    width: '100%',
    autoplay: 1,
  };

  const allMovies = filterParam.toString() === '0' ? movies : setMoviesToDisplay();
  return (
    <div className="container">
      <section id={id}>
        <Grid className={classes.heading} container justify="space-between" alignItems="center">
          <Grid item>
            <h5 className="section__heading">{title}</h5>
          </Grid>
          <Grid item>
            <Filter
              allGenres={allGenres}
              handleFilter={handleFilter}
              genres={genres}
            />
          </Grid>
        </Grid>
        <Grid className={`${classes.container} scrollbar`} container spacing={3}>
          {allMovies?.map(({ id, imageUrl, name }) => (
            <Grid className={classes.itemRoot} item key={id}>
              <MovieCard name={name} handleTrailerClick={handleTrailerClick} imgUrl={imageUrl} />
            </Grid>
          ))}
        </Grid>
      </section>
      {trailerUrl && <Youtube videoId={trailerUrl} opts={youtubeOptions} />}
    </div>
  );
}

MovieRow.propTypes = {
  title: PropTypes.string.isRequired,
  moviesUrl: PropTypes.string.isRequired,
  filterParam: PropTypes.string.isRequired,
  moviesFilter: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  allGenres: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
};

const mapStateToProps = state => ({
  filterParam: state.filter,
});

const mapDispatchToProps = dispatch => ({
  moviesFilter: param => dispatch(filterAction(param)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MovieRow);