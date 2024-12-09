import HomeScreen from './HomeScreen';
import { connect } from 'react-redux'
import { PropTypes } from 'prop-types'
import ExampleActions from '../../Stores/Example/Actions'
import { liveInEurope } from '../../Stores/Example/Selectors'

HomeScreen.propTypes = {
    user: PropTypes.object,
    userIsLoading: PropTypes.bool,
    userErrorMessage: PropTypes.string,
    fetchUser: PropTypes.func,
    liveInEurope: PropTypes.bool,
  }
  
  const mapStateToProps = (state) => ({
    user: state.example.user,
    userIsLoading: state.example.userIsLoading,
    userErrorMessage: state.example.userErrorMessage,
    liveInEurope: liveInEurope(state),
  })
  
  const mapDispatchToProps = (dispatch) => ({
    fetchUser: () => dispatch(ExampleActions.fetchUser()),
  })
  
  export default connect(
    mapStateToProps,
    mapDispatchToProps
  )(HomeScreen)
  