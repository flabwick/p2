import React from 'react'
import { TabType } from '../../../types/tabs'
import './WelcomeSelector.css'

interface WelcomeSelectorProps {
  onSelect: (type: TabType) => void
}

const PocketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" width="48" height="48">
    <path d="M 15 58 L 15 92 Q 15 118 60 125 Q 105 118 105 92 L 105 58"
          fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round"/>
    <path d="M 15 58 Q 15 34 60 47 Q 105 34 105 58 Q 82 73 60 79 Q 38 73 15 58 Z"
          fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round"/>
    <circle cx="60" cy="79" r="12" fill="currentColor" opacity="0.1"/>
    <circle cx="60" cy="79" r="10" fill="none" stroke="currentColor" strokeWidth="6"/>
  </svg>
)

const FileIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
)

const RoleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

export const WelcomeSelector: React.FC<WelcomeSelectorProps> = ({ onSelect }) => {
  return (
    <div className="welcome-selector">
      <h1 className="welcome-title">What would you like to create?</h1>
      <div className="welcome-options">
        <button className="welcome-option" onClick={() => onSelect('pocket')}>
          <div className="welcome-option-icon"><PocketIcon /></div>
          <div className="welcome-option-label">Pocket</div>
          <div className="welcome-option-desc">A container for your resources</div>
        </button>
        <button className="welcome-option" onClick={() => onSelect('file')}>
          <div className="welcome-option-icon"><FileIcon /></div>
          <div className="welcome-option-label">File</div>
          <div className="welcome-option-desc">Direct access to a file</div>
        </button>
        <button className="welcome-option" onClick={() => onSelect('role')}>
          <div className="welcome-option-icon"><RoleIcon /></div>
          <div className="welcome-option-label">Role</div>
          <div className="welcome-option-desc">Define an AI persona</div>
        </button>
      </div>
    </div>
  )
}
