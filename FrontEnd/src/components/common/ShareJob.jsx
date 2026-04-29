import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiShare2, FiCopy, FiMail, FiLink2, FiTwitter, FiFacebook, FiLinkedin } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ShareJob = ({ job }) => {
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const jobUrl = `${window.location.origin}/jobs/${job._id}`;
  const shareMessage = `Check out this job opening: ${job.title} at ${job.companyName} - ${jobUrl}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jobUrl);
      setCopied(true);
      toast.success('Job link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}`, '_blank');
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`, '_blank');
  };

  const shareToEmail = () => {
    window.location.href = `mailto:?subject=Job Opening: ${job.title}&body=${shareMessage}`;
  };

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowShare(!showShare)}
        className="btn btn-outline btn-sm flex items-center gap-2"
      >
        <FiShare2 />
        Share
      </motion.button>

      {showShare && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 shadow-xl rounded-2xl border z-50 p-4"
        >
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FiShare2 className="w-5 h-5" />
            Share {job.title}
          </h4>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={copyToClipboard}
              className="btn btn-ghost flex flex-col items-center gap-1 text-sm p-2 h-auto"
            >
              <FiCopy className="w-5 h-5" />
              <span>Copy Link</span>
              {copied && <span className="text-xs text-success">Copied!</span>}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={shareToWhatsApp}
              className="btn btn-ghost flex flex-col items-center gap-1 text-sm p-2 h-auto"
              title="WhatsApp"
            >
              <FaWhatsapp className="w-5 h-5 text-green-500" />
              <span>WhatsApp</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={shareToTwitter}
              className="btn btn-ghost flex flex-col items-center gap-1 text-sm p-2 h-auto"
              title="Twitter"
            >
              <FiTwitter className="w-5 h-5 text-blue-400" />
              <span>Twitter</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={shareToFacebook}
              className="btn btn-ghost flex flex-col items-center gap-1 text-sm p-2 h-auto"
              title="Facebook"
            >
              <FiFacebook className="w-5 h-5 text-blue-600" />
              <span>Facebook</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={shareToLinkedIn}
              className="btn btn-ghost flex flex-col items-center gap-1 text-sm p-2 h-auto"
              title="LinkedIn"
              colSpan={2}
            >
              <FiLinkedin className="w-5 h-5 text-blue-700" />
              <span>LinkedIn</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={shareToEmail}
              className="btn btn-ghost flex flex-col items-center gap-1 text-sm p-2 h-auto col-span-2"
              title="Email"
            >
              <FiMail className="w-5 h-5" />
              <span>Email</span>
            </motion.button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
            {jobUrl}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ShareJob;

