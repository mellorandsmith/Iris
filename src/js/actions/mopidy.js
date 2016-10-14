
/**
 * Actions and Action Creators
 **/

export function updateStatus( online ){
	return {
		type: 'STATUS',
		online: online
	}
}

export function updateState( state ){
	return {
		type: 'STATE',
		state: state
	}
}

export function updateConsume( consume ){
	return {
		type: 'CONSUME',
		consume: consume
	}
}

export function updateRandom( random ){
	return {
		type: 'RANDOM',
		random: random
	}
}

export function updateRepeat( repeat ){
	return {
		type: 'REPEAT',
		repeat: repeat
	}
}

export function updateTlTracks( tracks ){
	return {
		type: 'TRACKLIST',
		tracks: tracks
	}
}

export function updateCurrentTlTrack( tltrack ){
	return {
		type: 'TRACKINFOCUS',
		trackInFocus: tltrack
	}
}

export function updateVolume( volume ){
	return {
		type: 'VOLUME',
		volume: volume
	}
}

export function changeTrack( tlid ){
	return {
		type: 'CHANGE_TRACK',
		tlid: tlid
	}
}

