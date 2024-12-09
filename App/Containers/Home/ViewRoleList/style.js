import { StyleSheet } from 'react-native'
import { Helpers, Metrics, Fonts, Colors } from '../../../Theme'

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
  },
  logoContainer: {
    ...Helpers.fullWidth,
    height: 300,
    marginBottom: 25,
  },
  navigationLinearGradient: {
    width: '100%',
    height: '12%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
    position: 'relative'
  },
  titleText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  topContainer: {
    flexDirection: "column",
    marginTop: 20,
  },
  topSubContainer: {
    justifyContent: "center",
    flexDirection: "row",
    marginHorizontal: 5
  },
  innerContainer: {
    flex: 1,
    height: 102,
    borderRadius: 6,
    backgroundColor: Colors.white,
    marginHorizontal: 6,
    marginBottom: 12,
    shadowColor: "#00000019",
    shadowOffset: {
        width: 0,
        height: 2
    },
    shadowRadius: 5,
    shadowOpacity: 1,
  },
  innerImageContainer: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingTop: 15,
    paddingRight: 15,
  },
  innerTextContainer: {
    flexDirection: "column",
    marginLeft: 21,
  },
  innerIcon: {
    height: 24,
    width: 24,
  },
  headingTextAttendance: {
    fontSize: 16,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 24,
    letterSpacing: 0.32,
    color: '#3f77f4',
  },
  headingTextOutsource: {
    fontSize: 16,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 24,
    letterSpacing: 0.32,
    color: '#93a2dd'
  },
  headingTextAbest: {
    fontSize: 16,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 24,
    letterSpacing: 0.32,
    color: '#1dc9b7'
  },
  headingTextOnLeave: {
    fontSize: 16,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 24,
    letterSpacing: 0.32,
    color: '#dc3545'
  },
  headingTextOverTime: {
    fontSize: 16,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 24,
    letterSpacing: 0.32,
    color: '#fd397a'
  },
  headingTextException: {
    fontSize: 16,
    fontWeight: "600",
    fontStyle: 'normal',
    lineHeight: 24,
    letterSpacing: 0.32,
    color: '#ffb822'
  },
  subContentTextAttendance: {
    fontSize: 16,
    // fontWeight: "600",
    // fontStyle: "normal",
    lineHeight: 24,
    letterSpacing: 0.32,
    color: '#3f77f4',
  },
  subContentTextOutsource: {
    fontSize: 16,
    // fontWeight: "600",
    // fontStyle: "normal",
    lineHeight: 24,
    letterSpacing: 0.32,
    color: '#93a2dd'
  },
  subContentTextAbsent: {
    fontSize: 16,
    // fontWeight: "600",
    // fontStyle: "normal",
    lineHeight: 24,
    letterSpacing: 0.32,
    color: '#1dc9b7'
  },
  subContentTextOnleave: {
    fontSize: 16,
    // fontWeight: "600",
    // fontStyle: "normal",
    lineHeight: 24,
    letterSpacing: 0.32,
    color: '#dc3545'
  },
  subContentTextOverTime: {
    fontSize: 16,
    // fontWeight: "600",
    // fontStyle: "normal",
    lineHeight: 24,
    letterSpacing: 0.32,
    color: '#fd397a'
  },
  subContentTextException: {
    fontSize: 16,
    // fontWeight: "600",
    // fontStyle: "normal",
    lineHeight: 24,
    letterSpacing: 0.32,
    color: '#ffb822'
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    // marginTop: 48,
    marginBottom: 20,
  },
})
