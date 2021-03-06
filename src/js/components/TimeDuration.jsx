// @flow

import React, {Component, PropTypes} from 'react';
import moment from 'moment';
require('moment-duration-format');

type Props = {
     millis: number,
     hint?: string,
     liveUpdate: bool
};

type State = {
    elapsed: number
};

/**
 * Displays a millisecond duration as text in moment-duration-format's "humanize()" format,
 * e.g. "a few seconds", "2 hours", etc.
 * Also displays tooltip with more precise duration in "mos, days, hours, mins, secs" format.
 * Tooltip text can be overridden via "hint" property.
 * Set liveUpdate=true to tick the duration up as time elapses.
 *
 * Properties:
 * "millis": number or string.
 * "hint": string to use for tooltip.
 * "liveUpdate": boolean
 */
export class TimeDuration extends Component {

    props: Props;
    state: State;
    timerPeriodMillis: number;
    clearIntervalId: number;

    constructor(props: Props) {
        super(props);
        // track how much time has elapsed since live updating tracking started
        this.state = { elapsed: 0 };
        // When updating, average 30s period, with jitter to spread out the work
        this.timerPeriodMillis = 30000 + Math.ceil(Math.random() * 5000);
        this.clearIntervalId = 0;
        
    }

    componentWillMount() {
        this._handleProps(this.props);
    }

    componentWillReceiveProps(nextProps: Props) {
        this._handleProps(nextProps);
    }

    _handleProps(props: Props) {
        if (this.clearIntervalId) {
            clearInterval(this.clearIntervalId);
            this.clearIntervalId = 0;
        }

        if (props.millis >= 0 && props.liveUpdate) {
            this.clearIntervalId = setInterval(() => {
                this._updateTime();
            }, this.timerPeriodMillis);
        }

        // if live update is disabled, we no longer need to track elapsed time
        if (!props.liveUpdate) {
            this.setState({
                elapsed: 0,
            });
        }
    }

    _updateTime() {
        const elapsed = this.state.elapsed + this.timerPeriodMillis;
        this.setState({
            elapsed
        });
    }

    componentWillUnmount() {
        if (this.clearIntervalId) {
            clearInterval(this.clearIntervalId);
            this.clearIntervalId = 0;
        }
    }

    render() {
        const millis = parseInt(this.props.millis) + this.state.elapsed;

        if (!isNaN(millis)) {
            const duration = moment.duration(millis).humanize();

            const hint = this.props.hint ?
                this.props.hint :
                moment.duration(millis).format("M [mos], d [days], h[h], m[m], s[s]");

            return (
                <span title={hint}>{duration}</span>
            );
        }

        return (<span>-</span>);
    }
}

TimeDuration.propTypes = {
    millis: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    hint: PropTypes.string,
    liveUpdate: PropTypes.bool,
};
