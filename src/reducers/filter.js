import { FILTER_BOOK } from '../actions/type';

export default (state = 0, { type, payload }) => {
  switch (type) {
    case FILTER_BOOK:
      return payload;
    default:
      return state;
  }
};
