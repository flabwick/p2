import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const PocketContent = () => {
  const { id } = useParams();

  return (
    <motion.div
      className="pocket-content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="pocket-header">
        <h2 className="pocket-title">Pocket: {id}</h2>
        <span className="pocket-id">ID: {id}</span>
      </div>
      <div className="pocket-body">
        <div className="content-area">
          <div className="content-placeholder">
            <h3>Content Area</h3>
            <p>This is where the active pocket's editable content would appear.</p>
            <p>Blocks can be added, removed, and rearranged here.</p>
            <div className="content-grid">
              <div className="content-block">Block 1</div>
              <div className="content-block">Block 2</div>
              <div className="content-block">Block 3</div>
            </div>
          </div>
        </div>
      </div>
      <div className="pocket-footer">
        <span className="pocket-status">Last edited: Just now</span>
        <span className="pocket-sync">Sync: Pending</span>
      </div>
    </motion.div>
  );
};

export default PocketContent;
