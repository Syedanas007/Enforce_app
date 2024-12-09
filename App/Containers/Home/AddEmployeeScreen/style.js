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
    paddingBottom: 20
  },
  titleText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center'
  },
  checkInButton: {
    width: '100%',
    height: 60,
    borderRadius: 24,
    alignSelf: 'center',
    justifyContent: 'center',
},
checkInText: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: Colors.white,
    backgroundColor: 'transparent',
},
firstHeaderSection: {
    marginTop: 10,
    //flex: 1,
},
secondHeaderSection: {
    marginTop: 10,
   // flex: 1
},
sectionContainer: {
    height: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 24
}, 
sectionHeaderText : {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '400',
    backgroundColor: 'transparent',
    color: '#9e9e9e',
    fontStyle: 'italic'
}, 
   textViewContainer: {
     //  flex: 1,
     marginTop: 10,
     flexDirection: 'column',
},  
textFieldInputContainer: {
  flex: 1,
  height: 60,
  marginHorizontal: 24,
  borderColor: 'gray',
  borderWidth: 1,
  borderRadius: 8,
  marginBottom: 10,
  justifyContent: 'center',
  backgroundColor: '#f0f0f0'
},
textFieldInputText: {
    textAlign: 'left',
    fontSize: 14,
    fontWeight: '400',
    backgroundColor: 'transparent',
    color: '#9e9e9e',
    paddingLeft: 16,
    height :60
},
textFieldInputTextDropDown: {
  textAlign: 'left',
  fontSize: 14,
  fontWeight: '400',
  backgroundColor: '#f0f0f0',
  color: '#9e9e9e',
  paddingLeft: 16,
  height :60,
  borderColor: 'gray',
  borderWidth: 1,
  borderRadius: 8,
},
dropDownContainer: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#fcfcfc',
    borderRadius: 8,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#D3D3D3',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
   // paddingBottom:  16
 },
 dropDownInputContainer: {
    borderBottomColor: 'transparent',
    paddingLeft: 16,
    paddingRight:16,
    height: 120
 },
 pickerText: {
  textAlign: 'left',
  fontSize: 14,
  fontWeight: '400',
  backgroundColor: 'transparent',
  color: '#9e9e9e',
  paddingLeft: 16,
},
})