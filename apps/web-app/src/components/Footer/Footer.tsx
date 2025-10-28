export const Footer = () => {
  return (
    <footer className="w-full pt-9 pb-12 mt-10 px-4 flex flex-col lg:flex-row gap-4 justify-start text-center text-sm text-black dark:text-slate-500 border-t border-t-stone-200 dark:border-t-stone-800">
      <div className="flex flex-row flex-wrap justify-between items-start gap-8 lg:w-1/3 lg:flex-row lg:flex-nowrap">
        <div className="text-left">
          <h3 className="font-medium dark:text-gray-50 mb-3">
            Help & Feedback
          </h3>
          <ul className="flex flex-col gap-2">
            <li>
              <a href="#">Contact Support</a>
            </li>
            <li>
              <a href="#">X</a>
            </li>
            <li>
              <a href="#">Discord</a>
            </li>
            <li>
              <a href="#">Telegram</a>
            </li>
          </ul>
        </div>

        <div className="text-left">
          <h3 className="font-medium dark:text-gray-50 mb-3">Resources</h3>
          <ul className="flex flex-col gap-2">
            <li>
              <a href="#">Getting started</a>
            </li>
            <li>
              <a href="#">Fees</a>
            </li>
            <li>
              <a href="#">Blog</a>
            </li>
            <li>
              <a href="#">FAQ</a>
            </li>
          </ul>
        </div>

        <div className="text-left">
          <h3 className="font-medium dark:text-gray-50 mb-3">Legal</h3>
          <ul className="flex flex-col gap-2">
            <li>
              <a href="#">Terms of Service</a>
            </li>
            <li>
              <a href="#">Privacy Policy</a>
            </li>
            <li>
              <a href="#">Disclaimer</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-row mt-8 justify-start items-center gap-4 lg:items-start lg:order-first lg:w-1/3 lg:mt-0 lg:flex-col lg:justify-between">
        <div className="shrink-0 grow-0 flex items-center justify-center">
          <svg
            width="32"
            height="30"
            viewBox="0 0 32 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M32 19.733C32 20.6167 31.2837 21.333 30.4 21.333H22.933C22.0494 21.333 21.333 22.0494 21.333 22.933V28.2662C21.333 29.1499 20.6167 29.8662 19.733 29.8662H1.6C0.716345 29.8662 0 29.1499 0 28.2662V10.1332C0 9.24955 0.716344 8.5332 1.6 8.5332H9.06699C9.95065 8.5332 10.667 7.81686 10.667 6.9332V1.6C10.667 0.716344 11.3833 0 12.267 0H30.4C31.2837 0 32 0.716344 32 1.6V19.733Z"
              fill="#FF4500"
            />
          </svg>
        </div>

        <div className="shrink-0 flex flex-col items-start justify-center">
          <div className="lg:hidden">Sovryn Dex</div>
          <div className="text-xs lg:text-sm">
            Copyright {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </footer>
  );
};
