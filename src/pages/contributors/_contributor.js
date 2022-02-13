import React from 'react';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

const TeamMember = function ({
    login,
    avatar_url,
    html_url,
    contributions,
}) {
    return (
    <div className='col margin-vert--md'>
        <div className='card card--full-height'>
            <div className='card__header'>
                <div className='avatar avatar--vertical'>
                    <img className='avatar__photo avatar__photo--xl margin-vert--md' src={avatar_url} />
                    <div className='avatar__intro'>
                    <div className='avatar__name'>{login}</div>
                        <small className='avatar__subtitle'>{contributions} commits</small>
                    </div>
                </div>
            </div>

            <div className='card__footer'>
                <div className='link-list'>
                    <a href={html_url} className={clsx('contributor-github')}><FontAwesomeIcon icon={faGithub} /></a>
                </div>
            </div>
        </div>
    </div>
  );
};

export default TeamMember;