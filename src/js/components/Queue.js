
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import FontAwesome from 'react-fontawesome'
import TrackList from '../components/TrackList'
import Track from '../components/Track'
import Player from '../components/Player'
import * as actions from '../services/mopidy/actions'

class Queue extends React.Component{

	constructor(props) {
		super(props);
	}

	renderTrackInFocus(){
		if( this.props.mopidy && this.props.mopidy.trackInFocus ){
			return (
				<div>{ this.props.mopidy.trackInFocus.track.name }</div>
			);
		}
		return null;
	}

	renderTrackList(){
		if( this.props.mopidy && this.props.mopidy.tracks ){
			return (
				<TrackList tracks={this.props.mopidy.tracks} />
			);
		}
		return null;
	}

	render(){
		return (
			<div>
				<h3>Now playing</h3>
				{ this.renderTrackInFocus() }
				<h4>Other tracks</h4>
				{ this.renderTrackList() }
				<Player />
			</div>
		);
	}
}


/**
 * Export our component
 *
 * We also integrate our global store, using connect()
 **/

const mapStateToProps = (state, ownProps) => {
	return state;
}

const mapDispatchToProps = (dispatch) => {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Queue)