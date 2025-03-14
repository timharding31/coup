import type { LoaderFunction } from '@remix-run/node'

export const loader: LoaderFunction = () => {
  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg">
      <defs>
        <g id="robot">
          <path fill="currentColor" d="M32,224H64V416H32A31.96166,31.96166,0,0,1,0,384V256A31.96166,31.96166,0,0,1,32,224Zm512-48V448a64.06328,64.06328,0,0,1-64,64H160a64.06328,64.06328,0,0,1-64-64V176a79.974,79.974,0,0,1,80-80H288V32a32,32,0,0,1,64,0V96H464A79.974,79.974,0,0,1,544,176ZM264,256a40,40,0,1,0-40,40A39.997,39.997,0,0,0,264,256Zm-8,128H192v32h64Zm96,0H288v32h64ZM456,256a40,40,0,1,0-40,40A39.997,39.997,0,0,0,456,256Zm-8,128H384v32h64ZM640,256V384a31.96166,31.96166,0,0,1-32,32H576V224h32A31.96166,31.96166,0,0,1,640,256Z"/>
        </g>
        <g id="plus">
          <path fill="currentColor" d="M41.267,18.557H26.832V4.134C26.832,1.851,24.99,0,22.707,0c-2.283,0-4.124,1.851-4.124,4.135v14.432H4.141   c-2.283,0-4.139,1.851-4.138,4.135c-0.001,1.141,0.46,2.187,1.207,2.934c0.748,0.749,1.78,1.222,2.92,1.222h14.453V41.27   c0,1.142,0.453,2.176,1.201,2.922c0.748,0.748,1.777,1.211,2.919,1.211c2.282,0,4.129-1.851,4.129-4.133V26.857h14.435   c2.283,0,4.134-1.867,4.133-4.15C45.399,20.425,43.548,18.557,41.267,18.557z"/>
        </g>
        <g id="loading">
          <path stroke="none" fill="currentColor" d="M-13.25 21.3 Q-21.85 16.3 -24.4 6.8 -26.95 -2.85 -21.95 -11.5 L-21.95 -11.45 Q-17.05 -20.05 -7.4 -22.65 2.2 -25.35 10.85 -20.3 19.45 -15.35 22.05 -5.7 23.1 -1.8 22.9 2 L24.35 0.75 Q25.25 -0.05 26.5 0 27.75 0.1 28.55 1.05 29.4 1.95 29.3 3.2 29.2 4.45 28.3 5.25 L18.15 14.1 Q17.45 14.7 16.6 14.85 L14.9 14.6 Q14.05 14.2 13.6 13.45 L6.7 2.35 Q6.05 1.25 6.35 0.1 6.6 -1.15 7.7 -1.8 8.75 -2.45 9.95 -2.15 11.15 -1.9 11.8 -0.8 L12.9 0.95 Q12.95 -1.05 12.4 -3.05 L12.4 -3.1 Q10.85 -8.75 5.85 -11.65 0.8 -14.55 -4.75 -13 L-4.8 -13 Q-10.45 -11.5 -13.3 -6.5 -16.25 -1.45 -14.75 4.25 L-14.75 4.2 Q-13.25 9.75 -8.2 12.7 L-8.15 12.7 -5.6 13.95 Q-3.7 14.7 -2.85 16.6 -2 18.45 -2.7 20.4 -3.45 22.3 -5.35 23.15 L-9.15 23.3 Q-11.25 22.5 -13.2 21.35 L-13.25 21.3"/>
        </g>
        <g id="exclamation">
          <path d="M22.675,0.02c-0.006,0-0.014,0.001-0.02,0.001c-0.007,0-0.013-0.001-0.02-0.001C10.135,0.02,0,10.154,0,22.656   c0,12.5,10.135,22.635,22.635,22.635c0.007,0,0.013,0,0.02,0c0.006,0,0.014,0,0.02,0c12.5,0,22.635-10.135,22.635-22.635   C45.311,10.154,35.176,0.02,22.675,0.02z M22.675,38.811c-0.006,0-0.014-0.001-0.02-0.001c-0.007,0-0.013,0.001-0.02,0.001   c-2.046,0-3.705-1.658-3.705-3.705c0-2.045,1.659-3.703,3.705-3.703c0.007,0,0.013,0,0.02,0c0.006,0,0.014,0,0.02,0   c2.045,0,3.706,1.658,3.706,3.703C26.381,37.152,24.723,38.811,22.675,38.811z M27.988,10.578   c-0.242,3.697-1.932,14.692-1.932,14.692c0,1.854-1.519,3.356-3.373,3.356c-0.01,0-0.02,0-0.029,0c-0.009,0-0.02,0-0.029,0   c-1.853,0-3.372-1.504-3.372-3.356c0,0-1.689-10.995-1.931-14.692C17.202,8.727,18.62,5.29,22.626,5.29   c0.01,0,0.02,0.001,0.029,0.001c0.009,0,0.019-0.001,0.029-0.001C26.689,5.29,28.109,8.727,27.988,10.578z" fill="currentColor"/>
        </g>
        <g id="spinner">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="var(--nord-3)"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
        </g>
        <g id="card-back">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M403.495 14.7965L404 14.2915V0H389.708L390.163 0.454468C344.92 3.49683 302.032 21.7374 268.458 52.2169L216.292 0H187.759L135.491 52.2169C101.91 21.7559 59.0234 3.53333 13.7866 0.505005L14.2915 0H0V14.2915L0.504883 14.8469C2.73877 45.2024 11.8203 74.6572 27.0679 101C11.813 127.358 2.73096 156.831 0.504883 187.204L0 187.709V202.303C0.0297852 237.656 9.34668 272.381 27.0176 303C10.1929 332.099 1.19629 364.579 0.111328 397.267H0V411.559L0.504883 412.114C2.73877 442.469 11.8203 471.924 27.0679 498.267C19.5923 511.183 13.5991 524.848 9.16846 539H19.7598C23.2529 528.415 27.6924 518.073 33.0776 508.115C38.811 516.827 45.21 525.083 52.2168 532.809L46.0176 539H60.2876L93.8794 505.388L127.444 539H143.887C153.392 529.354 161.767 518.969 168.922 508.115C174.305 518.082 178.743 528.42 182.237 539H192.832C188.419 524.865 182.446 511.2 174.982 498.267C191.853 469.11 200.808 436.681 201.889 404H202.108C203.191 437.122 212.418 469.504 229.018 498.267C221.487 511.282 215.533 524.949 211.153 539H221.79C225.278 528.401 229.708 518.043 235.077 508.064C242.39 519.172 250.775 529.533 260.112 539H276.508L310.12 505.388L343.733 539H357.982L351.783 532.809C358.79 525.083 365.189 516.827 370.922 508.115C376.307 518.073 380.747 528.415 384.24 539H394.781C390.366 524.85 384.39 511.186 376.932 498.267C392.187 471.909 401.269 442.436 403.495 412.063L404 411.559V397.267H403.889C402.791 364.14 393.547 331.757 376.932 303C394.859 271.943 403.899 237.148 403.949 202.303V187.709L403.394 187.153C401.192 156.806 392.145 127.352 376.932 101C392.187 74.6423 401.269 45.1692 403.495 14.7965ZM383.95 398.236L337.542 351.783C305.509 380.864 264.997 398.804 222.051 403.031L268.458 449.484C300.491 420.402 341.003 402.464 383.95 398.236ZM182.033 402.987C140.257 398.913 99.6211 381.818 66.5083 351.834L19.9707 398.281C62.9224 402.49 103.444 420.414 135.491 449.484L182.033 402.987ZM174.982 101C192.988 69.8815 201.977 35.0354 202 0.134399C202 35.5435 211.317 70.3301 229.018 101C211.012 132.119 202.023 166.964 202 201.865C202 166.457 192.683 131.67 174.982 101ZM370.922 312.797C384.507 338.047 392.082 365.721 393.597 393.597L344.814 344.814C354.583 335.058 363.331 324.33 370.922 312.797ZM295.879 310.121L330.371 344.612C296.687 375.013 254.823 391.325 212.403 393.597L295.879 310.121ZM254.217 337.542L213.867 377.841C216.972 355.062 224.156 333.028 235.077 312.797C240.809 321.527 247.208 329.8 254.217 337.542ZM261.337 330.371C253.684 321.879 246.806 312.719 240.784 303C246.806 293.283 253.684 284.123 261.337 275.629L288.708 303L261.337 330.371ZM235.077 293.203C240.809 284.474 247.208 276.2 254.217 268.458L213.867 228.159C216.972 250.939 224.156 272.973 235.077 293.203ZM330.371 261.338L295.879 295.88L212.403 212.353C256.18 214.67 297.829 231.965 330.371 261.338ZM337.693 337.694L303 303L337.693 268.307C348.172 278.774 357.407 290.415 365.216 303C357.408 315.586 348.173 327.227 337.693 337.694ZM202.555 389.153C204.758 358.806 213.805 329.352 229.018 303H229.068C213.795 276.647 204.696 247.174 202.454 216.797L201.949 216.292L201.394 216.847C199.192 247.194 190.145 276.649 174.932 303C190.187 329.358 199.269 358.831 201.495 389.204L202 389.709L202.555 389.153ZM393.597 10.3524C349.82 12.6699 308.171 29.9646 275.629 59.3374L310.12 93.8795L393.597 10.3524ZM317.292 101L344.662 128.371C352.316 119.879 359.194 110.719 365.216 101C359.194 91.2825 352.316 82.1224 344.662 73.629L317.292 101ZM351.783 135.542C358.79 127.817 365.189 119.561 370.922 110.848C381.982 131.3 389.052 153.369 392.132 175.841L351.783 135.542ZM275.629 142.612C308.171 171.985 349.82 189.28 393.597 191.597L310.12 108.121L275.629 142.612ZM303 101L268.306 66.3065C257.827 76.7734 248.592 88.4148 240.784 101C248.593 113.586 257.828 125.227 268.306 135.694L303 101ZM212.403 10.403L261.186 59.1859C251.417 68.9426 242.669 79.6702 235.077 91.2029C221.493 65.953 213.918 38.2789 212.403 10.403ZM235.077 110.797C221.493 136.047 213.918 163.721 212.403 191.597L261.186 142.814C251.417 133.058 242.669 122.33 235.077 110.797ZM393.597 212.403L344.814 261.186C354.583 270.943 363.331 281.67 370.922 293.203C384.507 267.953 392.082 240.279 393.597 212.403ZM337.542 254.217L390.163 201.546C344.92 198.504 302.032 180.263 268.458 149.783L215.837 202.455C261.08 205.497 303.968 223.738 337.542 254.217ZM370.922 91.2029C365.191 82.4733 358.792 74.2 351.783 66.458L392.132 26.1589C389.028 48.9387 381.843 70.972 370.922 91.2029ZM73.6289 261.388C107.312 230.987 149.177 214.676 191.597 212.403L108.12 295.88L73.6289 261.388ZM142.662 330.371L115.291 303L142.662 275.629C150.316 284.123 157.194 293.283 163.216 303C157.307 312.595 150.439 321.786 142.662 330.371ZM73.6289 344.663L108.12 310.121L191.597 393.648C147.82 391.33 106.171 374.036 73.6289 344.663ZM149.783 337.542L190.132 377.841C187.028 355.062 179.844 333.028 168.922 312.797C163.191 321.527 156.792 329.8 149.783 337.542ZM66.3066 268.307L101 303L66.3066 337.694C55.8281 327.227 46.5928 315.586 38.7842 303C46.5928 290.415 55.8281 278.774 66.3066 268.307ZM188.163 202.404L188.069 202.41L135.542 149.733C101.968 180.213 59.0801 198.453 13.8369 201.495L66.458 254.167C100.009 223.708 142.86 205.471 188.069 202.41L188.163 202.505V202.404ZM33.0776 293.153C40.6714 281.637 49.4194 270.927 59.186 261.186L10.3525 212.353C11.8677 240.279 19.4424 267.903 33.0776 293.153ZM10.3525 393.648C11.8677 365.721 19.4424 338.098 33.0776 312.848C40.6714 324.363 49.4194 335.074 59.186 344.814L10.3525 393.648ZM168.922 293.153C179.982 272.7 187.052 250.632 190.132 228.159L149.783 268.458C156.79 276.184 163.189 284.441 168.922 293.153ZM191.647 191.648C190.132 163.721 182.557 136.098 168.922 110.848C161.499 122.109 152.762 132.866 142.814 142.814L191.647 191.648ZM128.371 142.663L93.8794 108.121L10.4028 191.648C54.1797 189.33 95.8286 172.036 128.371 142.663ZM11.8677 175.841L52.2168 135.542C45.21 127.817 38.811 119.561 33.0776 110.848C22.0181 131.3 14.9482 153.369 11.8677 175.841ZM38.7842 101C44.8062 110.718 51.6846 119.879 59.3374 128.371L86.7085 101L59.3374 73.629C51.6846 82.1224 44.8062 91.2825 38.7842 101ZM52.2168 66.458C45.21 74.1838 38.811 82.4396 33.0776 91.1525C22.0181 70.7 14.9482 48.6315 11.8677 26.1589L52.2168 66.458ZM128.371 59.3879C95.8286 30.015 54.1797 12.7205 10.4028 10.403L93.8794 93.8795L128.371 59.3879ZM101 101L135.693 135.694C146.173 125.227 155.408 113.586 163.216 101C155.408 88.4148 146.173 76.7734 135.693 66.3065L101 101ZM142.814 59.1859C152.581 68.9265 161.329 79.6371 168.922 91.1525V91.2029C182.507 65.953 190.082 38.2789 191.597 10.403L142.814 59.1859ZM275.629 456.604C308.171 427.232 349.82 409.937 393.597 407.619L310.12 491.146L275.629 456.604ZM344.662 525.638L317.292 498.267L344.662 470.896C352.316 479.389 359.194 488.549 365.216 498.267C359.194 507.985 352.316 517.145 344.662 525.638ZM268.306 463.574L303 498.267L268.306 532.96C257.828 522.493 248.593 510.852 240.784 498.267C248.592 485.682 257.827 474.04 268.306 463.574ZM261.186 456.453L212.403 407.67C213.918 435.546 221.493 463.22 235.077 488.47C242.669 476.937 251.417 466.21 261.186 456.453ZM351.783 463.725C358.792 471.467 365.191 479.74 370.922 488.47C381.843 468.239 389.028 446.206 392.132 423.426L351.783 463.725ZM59.3374 525.638C51.6846 517.145 44.8062 507.985 38.7842 498.267C44.8062 488.549 51.6846 479.389 59.3374 470.896L86.7085 498.267L59.3374 525.638ZM33.0776 488.419C38.811 479.707 45.21 471.451 52.2168 463.725L11.8677 423.426C14.9482 445.898 22.0181 467.967 33.0776 488.419ZM10.4028 407.67C54.1797 409.988 95.8286 427.282 128.371 456.655L93.8794 491.146L10.4028 407.67ZM135.693 532.96L101 498.267L135.693 463.574C146.173 474.04 155.408 485.682 163.216 498.267C155.408 510.852 146.173 522.493 135.693 532.96ZM168.922 488.419C161.329 476.904 152.581 466.193 142.814 456.453L191.597 407.67C190.082 435.546 182.507 463.22 168.922 488.47V488.419Z" fill="currentColor"/>
        </g>
        <g id="sword">
          <path stroke="none" fill="currentColor" d="M13.5 -26.45 Q14.25 -27 15.25 -27 L24.4 -27 Q25.35 -27 26.05 -26.45 L26.25 -26.3 Q27 -25.5 27 -24.45 L27 -15.2 Q27 -14.25 26.25 -13.4 L2.2 10.65 4 12.45 4.3 12.1 Q4.45 11.85 4.8 11.8 L5.4 11.65 6.15 11.65 Q7.15 11.65 7.95 12.4 L8.1 12.55 Q8.7 13.3 8.7 14.2 L8.7 20.35 Q8.7 21.3 8.1 22 L7.8 22.3 Q7.05 22.9 6.15 22.9 L0 22.9 Q-2.7 22.9 -2.6 20.35 L-2.6 19.75 Q-2.6 19.05 -2.1 18.6 L-1.65 18.1 -2 17.8 -5.55 14.35 -9.6 18.4 -9.6 24.4 Q-9.6 25.45 -10.4 26.2 -11.15 27 -12.2 27 L-24.35 27 Q-27 27 -27 24.4 L-27 12.15 Q-27 9.55 -24.35 9.55 L-18.45 9.55 -14.4 5.5 -18.15 1.65 -18.65 2.2 Q-19.1 2.55 -19.8 2.55 L-20.3 2.55 Q-23 2.55 -22.95 0 L-22.95 -6.15 Q-22.95 -8.75 -20.3 -8.75 L-14.15 -8.75 Q-13.2 -8.75 -12.35 -7.95 L-12.2 -7.8 Q-11.7 -7.05 -11.7 -6.15 L-11.7 -5.45 Q-11.7 -4.85 -12.15 -4.35 L-12.5 -3.95 -10.7 -2.15 13.35 -26.3 13.5 -26.45"/>
        </g>
        <g id="skull">
          <path stroke="none" fill="currentColor" d="M9 12 Q11.55 12 13.2 10.35 15 8.55 15 6 15 3.6 13.2 1.8 11.55 0 9 0 6.45 0 4.65 1.8 3 3.45 3 6 3 8.55 4.65 10.35 6.45 12 9 12 M-9 12 Q-6.45 12 -4.8 10.35 -3 8.55 -3 6 -3 3.6 -4.8 1.8 -6.45 0 -9 0 -11.55 0 -13.35 1.8 -15 3.45 -15 6 -15 8.55 -13.35 10.35 -11.55 12 -9 12 M0 -30 Q11.1 -30 19.05 -22.5 27 -15 27 -4.5 27 1.5 24 7.2 L24 12 Q24 14.55 22.2 16.35 20.55 18 18 18 L12 18 12 24 Q12 26.55 10.2 28.35 8.55 30 6 30 L-6 30 Q-8.55 30 -10.35 28.35 -12 26.55 -12 24 L-12 18 -18 18 Q-20.55 18 -22.35 16.35 -24 14.55 -24 12 L-24 7.2 Q-27 1.95 -27 -4.5 -27 -15 -19.05 -22.5 -11.25 -30 0 -30"/>
        </g>
        <g id="shield">
          <path stroke="none" fill="currentColor" d="M22.3 -19.55 Q24.4 -19.35 25.75 -17.75 27.15 -16.2 27 -14.1 26.25 4.45 16.3 16.8 10.2 24.3 2.35 28.05 L0.1 28.5 -2.15 28.05 Q-10.1 24.3 -16.2 16.8 -26.15 4.45 -26.9 -14.1 -27 -16.2 -25.65 -17.75 -24.3 -19.35 -22.2 -19.55 -13.35 -20.4 -4.4 -27 -2.4 -28.4 0.1 -28.4 2.5 -28.4 4.5 -27 13.45 -20.45 22.3 -19.55"/>
        </g>
        <g id="steal">
          <path fill="currentColor" d="M336.406,166.563c-10.891,1.75-72.609,12.094-76.5,12.094c-3.906,0-3.906,0-3.906,0s0,0-3.906,0 s-65.609-10.344-76.5-12.094c-18.719-3.031-34.344,2.266-39.813,4.531c-22.969,9.531-15.25,31.813-10.156,40.063 c7.047,11.344,33.781,41.125,60.125,44.609c34.344,4.516,64-21.172,70.25-21.172c6.234,0,35.906,25.688,70.25,21.172 c26.344-3.484,53.094-33.266,60.125-44.609c5.094-8.25,12.813-30.531-10.156-40.063 C370.734,168.828,355.125,163.531,336.406,166.563z M184.656,220.984c-11.094-10.734-9.25-21.516,3.688-22.391 c12.969-0.906,34.813,4.5,35.172,11.656C224.438,228.156,195.75,231.75,184.656,220.984z M327.344,220.984 c-11.109,10.766-39.797,7.172-38.859-10.734c0.359-7.156,22.203-12.563,35.141-11.656 C336.594,199.469,338.438,210.25,327.344,220.984z"/>
          <path fill="currentColor" d="M402.75,115.906c0-5.031-5.219-15.094-14.578-17.125C374.656,19.156,296.563,0,256,0 S137.344,19.156,123.813,98.781c-9.375,2.031-14.563,12.094-14.563,17.125c0,5.047,0,33.25,0,33.25h293.5 C402.75,149.156,402.75,120.953,402.75,115.906z"/>
          <path fill="currentColor" d="M356.719,382.234c0-20.203-6.281-42.297-26.234-42.297H181.5c-19.938,0-26.234,22.094-26.234,42.297 c0,4.797-93.359,28.828-93.359,82.656c0,12.516,30.422,47.109,193.031,47.109h2.109c162.625,0,193.047-34.594,193.047-47.109 C450.094,411.063,356.719,387.031,356.719,382.234z"/>
        </g>
        <g id="steal">
          <path stroke="none" fill="currentColor" d="M9.8 -25.45 Q11.2 -24.65 10.95 -21.75 L10.95 -21.7 Q9.9 -14.95 6.15 -13.85 3.6 -12.75 0.1 -13.05 L-0.1 -13.05 Q-3.6 -12.75 -6.2 -13.85 -9.9 -14.95 -10.95 -21.7 L-10.95 -21.75 Q-11.2 -24.65 -9.8 -25.45 L-5.9 -25.35 -5.95 -25.35 Q-2.8 -24 0 -24 2.8 -24 5.9 -25.35 L9.8 -25.45 M26.5 -8.8 Q27.15 -7.75 26.9 -6.5 26.6 -5.3 25.55 -4.65 L24.65 -4.25 26.7 -0.25 Q27.2 0.95 26.75 2.1 26.25 3.25 25.1 3.75 L22.75 3.8 Q21.6 3.3 21.1 2.2 17.85 -5.2 11.2 -10.5 10.4 -11.1 10.15 -12 9.85 -12.9 10.15 -13.75 10.4 -14.65 11.2 -15.25 11.9 -15.9 12.8 -15.95 21.6 -16.7 26.5 -8.8 M0 26 Q-17.15 25.8 -18.8 16 -9.7 19.8 -2.55 16.3 L-2.65 16.4 Q0 15.25 1.05 12.65 L1.15 12.65 Q2.15 9.9 1.05 7.25 L1.05 7.2 Q-0.05 4.6 -2.7 3.4 -5.35 2.35 -7.9 3.35 -10.8 4.1 -14.6 2.45 -14.25 1.1 -14.75 -0.35 L-15.3 -1.65 Q-13.35 -5.95 -10.5 -8.6 -8.6 -10.6 -5.3 -9.7 -2.6 -8.7 -0.15 -8.7 2.6 -8.7 5.35 -9.7 8.65 -10.6 10.55 -8.6 17.15 -2.4 18.95 12.85 19.75 25.75 0 26 M-20 -1.1 L-18.5 -0.95 Q-17.75 -0.55 -17.5 0.25 -17.3 1 -17.7 1.75 -18.1 2.5 -18.85 2.75 L-19.5 2.95 -17.35 4.2 Q-11.25 7.45 -6.85 5.95 -5.3 5.3 -3.75 5.95 -2.25 6.6 -1.6 8.15 -0.95 9.65 -1.6 11.2 -2.25 12.7 -3.75 13.35 -10.3 16.45 -18.9 12.45 L-21.25 11.25 Q-20.95 12 -21.25 12.75 -21.55 13.5 -22.3 13.85 -23.1 14.15 -23.85 13.85 -24.6 13.55 -24.95 12.8 L-27.35 7.05 Q-28.05 6.2 -28.2 5.1 L-28.2 5 -28.7 3.85 -28.8 2.75 Q-28.75 2.15 -28.35 1.75 L-27.4 1.15 -20 -1.1"/>
        </g>
        <g id="lock">
          <path stroke="none" fill="currentColor" d="M-8 -10 L-8 -6 8 -6 8 -10 Q8 -13.3 5.65 -15.65 3.3 -18 0 -18 -3.3 -18 -5.65 -15.7 L-5.7 -15.65 Q-8 -13.3 -8 -10 M16 -6 Q20 -6 20 -2 L20 22 Q20 23.95 19.05 24.95 18.05 26 16 26 L-16 26 Q-18.05 26 -19.05 24.95 -20 23.95 -20 22 L-20 -2 Q-20 -6 -16 -6 L-16 -10 Q-16 -16.6 -11.35 -21.3 L-11.3 -21.35 Q-6.6 -26 0 -26 6.6 -26 11.3 -21.3 16 -16.6 16 -10 L16 -6 M0 2 Q-2.05 2 -3.5 3.45 L-3.55 3.5 Q-5 4.95 -5 7 -5 9.05 -3.55 10.5 L-2.45 11.35 -2.1 11.75 -2 12.2 -2 15.75 Q-2 16.55 -1.4 17.15 -0.8 17.75 0 17.75 0.8 17.75 1.4 17.15 2 16.55 2 15.75 L2 12.2 2.15 11.75 2.5 11.35 3.5 10.55 3.55 10.5 Q5 9.05 5 7 5 4.95 3.5 3.45 2.05 2 0 2"/>
        </g>
        <g id="challenge">
          <path stroke="none" fill="currentColor" d="M-12.5 -26 L-8.65 -25 Q-7.8 -24.75 -7.4 -24 -7 -23.35 -7.25 -22.5 L-7.65 -20.85 Q2.2 -23.9 8.65 -14.05 14.3 -5.55 23.45 -10.1 L24.95 -10.25 Q25.75 -10 26.15 -9.25 26.5 -8.55 26.3 -7.8 L20.05 15.4 19.7 16.15 19.1 16.7 Q6.7 22.85 -0.85 11.35 -6.4 3 -15.15 7.1 L-19.65 23.85 Q-19.85 24.65 -20.6 25.1 L-22.1 25.25 -25.95 24.25 Q-26.8 24 -27.2 23.3 -27.6 22.55 -27.4 21.75 L-15 -24.6 Q-14.75 -25.45 -14 -25.8 L-12.5 -26"/>
        </g>
        <g id="exchange">
          <path stroke="none" fill="currentColor" d="M20.95 -10.85 Q21.75 -12.35 21.35 -14.05 L24.2 -12.8 24.15 -12.8 Q28.7 -10.85 28.7 -7.9 29.5 -5.1 25.75 -1.85 L24.2 -0.55 26.65 1 Q30.85 3.6 30.45 6.55 30.85 9.4 26.65 12.05 L1.6 27.75 Q-4.75 31.7 -11.1 27.75 L-11.15 27.75 -26.6 18 -26.55 18 Q-30.8 15.4 -30.4 12.5 -30.6 10.95 -29.5 9.55 -30.6 8.35 -30.6 6.95 -31.45 4.15 -27.65 1 L-27.6 0.95 -18.55 -6.8 Q-16.95 -4.5 -14.9 -2.65 L-14.95 -2.75 -14.5 -2.35 -23.75 5.55 -24.55 6.05 -23.6 6.3 -23.5 6.35 -23.45 6.4 -23.2 6.45 -6.9 13.7 -6.85 13.7 Q-3.4 15.15 -0.6 12.75 L-0.6 12.8 17 -2.2 17.45 -2.65 21.85 -6.4 22.8 -7.05 Q22.45 -7 21.8 -7.3 L21.75 -7.3 19.6 -8.25 20.9 -10.75 20.95 -10.85 M0.05 -21.35 Q-3.45 -21.35 -5.9 -18.95 -8.3 -16.45 -8.3 -13 -8.3 -9.5 -5.9 -7.05 -3.45 -4.6 0.05 -4.6 3.5 -4.6 6 -7.05 8.45 -9.5 8.45 -13 8.45 -16.45 6 -18.95 3.5 -21.35 0.05 -21.35 M0.05 -18 Q2.15 -18 3.6 -16.5 5.1 -15.1 5.1 -13 5.1 -10.9 3.6 -9.4 2.15 -7.95 0.05 -7.95 -2.05 -7.95 -3.55 -9.4 -4.95 -10.8 -4.95 -13 -4.95 -15.1 -3.55 -16.5 -2.05 -18 0.05 -18 M0.05 -26.4 Q7.45 -26.4 12.95 -21.1 16.25 -17.95 18.25 -13.75 18.65 -12.9 18.25 -12.15 16.25 -7.95 12.95 -4.8 7.45 0.4 0.05 0.4 -7.4 0.4 -12.9 -4.9 -16.25 -7.95 -18.3 -12.25 -18.55 -12.9 -18.3 -13.65 -16.25 -17.95 -12.9 -21.1 -7.4 -26.4 0.05 -26.4"/>
        </g>
        <g id="exchange_">
          <path stroke="none" fill="currentColor" d="M19.3 9.2 L20.8 8.1 21 8.95 Q23.3 17.6 14.65 19.95 L-2.75 24.6 Q-9.2 26.3 -12.1 22.05 L-13.3 22.25 -13.6 22.25 -16.85 21.95 Q-18.85 21.5 -20.5 20.3 -22.9 18.5 -24.55 14.95 L-24.6 14.8 Q-28.15 7.4 -22.4 -2.75 L-22.55 -2.7 Q-23.3 -2.4 -24.05 -2.7 -24.85 -3.05 -25.15 -3.8 -25.45 -4.55 -25.15 -5.3 -24.8 -6.1 -24.05 -6.4 L-18.05 -8.9 Q-17.35 -9.45 -16.4 -9.6 L-15.05 -10.15 -13.95 -10.25 Q-13.4 -10.2 -12.95 -9.8 L-12.35 -8.85 -10.15 -1.4 Q-9.95 -0.65 -10.35 0.1 -10.75 0.85 -11.5 1.1 L-13.05 0.9 Q-13.8 0.5 -14 -0.25 L-14.2 -0.9 Q-18.95 6.5 -17.3 11.6 L-17.3 11.65 -17.25 11.7 Q-16.35 13.6 -14.9 14.2 L-14.1 14.25 Q-13.9 12.55 -14.55 10.8 -15.35 7.9 -13.6 4 L-11.35 4.1 -8 16.7 Q-7.25 19.6 -4.3 18.8 L9.8 15.05 13.85 15.55 Q15.9 15.8 17.55 14.55 19.2 13.25 19.45 11.2 19.6 10.15 19.3 9.2 M14.45 -7.1 Q13.85 -4.85 11.65 -2.8 L7.95 -16.55 Q7.2 -19.45 4.3 -18.7 L-3.45 -16.65 -3.85 -16.55 -4.4 -16.35 -13.1 -14.05 -14.65 -13.3 -16.4 -12.9 -17.5 -12.45 Q-18.8 -12.2 -19.8 -11.45 L-21.45 -10.75 Q-22.35 -17.8 -14.65 -19.85 L-5.95 -22.15 -5.6 -22.2 -5.05 -22.45 2.7 -24.5 2.75 -24.5 Q10.95 -26.7 13.5 -19 L15.4 -18.75 Q19.7 -18 22.1 -15.65 L22.15 -15.6 Q23.75 -14.2 24.65 -12.2 25.75 -9.5 25.45 -5.7 L25.45 -5.55 Q24.75 2.65 14.75 8.6 L14.8 8.6 Q15.6 8.65 16.15 9.35 16.65 10 16.55 10.8 16.45 11.6 15.8 12.15 15.1 12.65 14.3 12.55 L8 11.75 6.1 11.5 4.65 11.35 3.65 10.9 3 10 Q2.8 9.45 2.95 8.9 L4.75 1.3 Q4.95 0.5 5.65 0.05 L7.2 -0.2 Q7.95 0 8.4 0.7 8.85 1.4 8.65 2.2 L8.5 2.85 Q16.4 -1.2 17.5 -6.55 L17.5 -6.4 Q17.65 -8.55 16.7 -9.75 L16.65 -9.75 15.85 -10.3 Q14.75 -8.95 14.45 -7.1"/>
        </g>
        <g id="token-1">
          <path stroke="none" fill="currentColor" d="M128,24A104,104,0,1,0,232,128,104.11791,104.11791,0,0,0,128,24Zm12,152a8,8,0,0,1-16,0V98.94434l-11.56348,7.70605a8.00008,8.00008,0,1,1-8.873-13.31445l24-15.99317A8.00039,8.00039,0,0,1,140,84Z" />
        </g>
        <g id="token-2">
          <path stroke="none" fill="currentColor" d="M128,24A104,104,0,1,0,232,128,104.11791,104.11791,0,0,0,128,24Zm24,143.99414a8,8,0,0,1,0,16H104.31738c-.10644.00391-.21289.00684-.31836.00684a8.00343,8.00343,0,0,1-6.30175-12.93164L141.37012,112.794a16.00416,16.00416,0,1,0-28.11621-15.01954A8,8,0,1,1,98.51758,91.542a32.00411,32.00411,0,1,1,56.01269,30.35547c-.07324.1084-.14843.21484-.22754.31934l-34.30566,45.77734Z"/>
        </g>
        <g id="token-3">
        <path stroke="none" fill="currentColor" d="M128,24A104,104,0,1,0,232,128,104.11791,104.11791,0,0,0,128,24Zm21.458,153.45605a35.99982,35.99982,0,0,1-50.91113,0,8.00052,8.00052,0,0,1,11.31445-11.31445A19.99959,19.99959,0,1,0,124.00293,132a8,8,0,0,1-6.55469-12.58691l19.1875-27.4209H103.99707a8,8,0,0,1,0-16h48a8,8,0,0,1,6.55469,12.58691L137.5332,118.61816A36.019,36.019,0,0,1,149.458,177.45605Z"/>
        </g>
        <g id="check">
          <path stroke="none" fill="currentColor" d="M128,24A104,104,0,1,0,232,128,104.12041,104.12041,0,0,0,128,24Zm49.53125,85.78906-58.67187,56a8.02441,8.02441,0,0,1-11.0625,0l-29.32813-28a8.00675,8.00675,0,0,1,11.0625-11.57812l23.79687,22.72656,53.14063-50.72656a8.00675,8.00675,0,0,1,11.0625,11.57812Z"/>
        </g>
        <g id="dollar">
          <path stroke="none" fill="currentColor" d="M0.5 -11.2 Q-1.7 -11.2 -2.75 -10.35 L-2.9 -10.2 Q-3.8 -9.4 -3.8 -7.8 -3.8 -6.45 -2.9 -5.7 L-2.7 -5.55 Q-1.4 -4.5 2.1 -3.4 6.6 -2 8.75 -0.7 L9 -0.5 Q11.2 0.95 12.45 2.95 L12.7 3.2 Q14 5.5 14 8.5 14 13.3 10.7 16.3 8.25 18.55 3.9 19.35 L3.9 20 Q3.9 24 -0.05 24 L-0.1 24 Q-2.05 24.05 -3 23 -4 22 -4 20 L-4 19.35 Q-8.4 18.5 -10.9 16.1 L-11 16 Q-12.45 14.6 -13.5 12.15 L-13.55 12 Q-14 11.1 -14 9.7 -14 8.05 -13 6.9 L-12.75 6.65 -12.5 6.4 Q-11.45 5.3 -9.7 5.3 -7.15 5.3 -5.85 7.5 L-5.75 7.7 -5.7 7.8 -5.4 8.6 -5.35 8.75 -5.3 9 Q-5.15 10 -4.4 10.8 -2.85 12 -0.1 12 2.55 12 3.95 10.95 L3.9 11.05 4.2 10.8 Q5.2 9.95 5.2 8.6 5.2 7.35 4.3 6.6 L4.2 6.5 4.15 6.45 Q2.8 5.25 -0.25 4.3 L-0.6 4.3 Q-6.4 2.65 -9.2 0.05 L-9.5 -0.1 Q-12.6 -3.1 -12.6 -7.8 -12.6 -12.5 -9.45 -15.4 L-9.5 -15.4 Q-7.3 -17.7 -3.5 -18.45 L-3.5 -20 Q-3.5 -24 0.5 -24 2.1 -24 3.3 -22.8 4.5 -21.6 4.5 -20 L4.5 -18.55 Q8.4 -17.6 10.7 -14.9 L10.7 -14.95 Q12.8 -12.75 13.3 -9.4 L13.3 -9.3 13.4 -8.5 13.4 -8.4 13.4 -8.3 Q13.4 -4 9.15 -4 L9.1 -4 Q6 -3.9 4.9 -7.3 L4.5 -8.6 3.9 -9.65 Q3.55 -9.8 3.45 -10.15 2.35 -11.2 0.5 -11.2"/>
        </g>
        <g id="arrow">
          <path stroke="none" fill="currentColor" d="M-21.05 5 Q-23.1 5 -24.55 3.55 -26.05 2.05 -26.05 0 -26.05 -2.05 -24.55 -3.5 -23.1 -5 -21.05 -5 L11.8 -5 8.9 -7.9 Q8 -8.8 8 -10.05 8 -11.3 8.9 -12.15 9.75 -13.05 11 -13.05 12.25 -13.05 13.15 -12.15 L23.2 -2.1 Q24.05 -1.25 24.05 0 24.05 1.25 23.2 2.1 L13.15 12.15 Q12.25 13.05 11.05 13.05 9.8 13.05 8.9 12.2 8 11.3 8 10.1 8 8.85 8.9 7.95 L11.85 5 -21.05 5"/>
        </g>
        <g id="chip">
          <path d="M165.025 24.0297C150.338 11.4588 133.061 3.88989 115.262 1.15983C82.2128 -3.91037 47.3716 7.70469 24.0302 34.9756C-11.8822 76.9337 -6.98201 140.058 34.976 175.971C49.6625 188.542 66.9387 196.11 84.7377 198.841C117.787 203.911 152.629 192.295 175.97 165.023C211.882 123.066 206.981 59.9415 165.025 24.0297ZM184.406 129.009L153.844 118.473C157.96 106.464 157.91 93.4415 153.853 81.5573L184.383 71.0506C186.796 78.102 188.338 85.5063 188.93 93.1373C189.889 105.488 188.313 117.64 184.406 129.009ZM167.254 41.4685L142.922 62.6047C141.122 60.5439 139.159 58.5835 137.018 56.7513C129.283 50.1309 120.282 45.9613 110.954 44.1419L117.09 12.611C132.153 15.5319 146.239 22.2535 157.993 32.315C161.326 35.1672 164.416 38.2285 167.254 41.4685ZM69.6519 16.1789C73.9882 14.6172 78.4357 13.407 82.9481 12.5442L89.0781 44.1439C77.0778 46.4827 65.7481 52.6782 57.1073 62.5879L32.7513 41.4065C42.7244 29.9627 55.4552 21.2956 69.6519 16.1789ZM15.5992 70.9912L46.156 81.5263C42.0397 93.536 42.0896 106.557 46.1459 118.442L15.5904 128.957C13.1875 121.914 11.6528 114.521 11.0619 106.906C10.1026 94.5445 11.6839 82.3742 15.5992 70.9912ZM32.6953 158.573L57.0783 137.394C58.8787 139.456 60.8425 141.418 62.9836 143.25C70.7184 149.87 79.7188 154.038 89.0457 155.859L82.8779 187.562C67.8177 184.629 53.7458 177.833 41.9951 167.774C38.6458 164.909 35.5434 161.833 32.6953 158.573ZM130.333 183.917C126.009 185.474 121.572 186.689 117.071 187.561L110.921 155.856C122.921 153.517 134.252 147.322 142.893 137.411L167.259 158.599C157.283 170.055 144.535 178.798 130.333 183.917Z" fill="currentColor"/>
          <path d="M62.9877 41.4858C65.9682 41.4858 68.3844 39.0697 68.3844 36.0891C68.3844 33.1086 65.9682 30.6924 62.9877 30.6924C60.0072 30.6924 57.591 33.1086 57.591 36.0891C57.591 39.0697 60.0072 41.4858 62.9877 41.4858Z" fill="currentColor"/>
          <path d="M26.1457 105.494C29.1263 105.494 31.5424 103.077 31.5424 100.097C31.5424 97.1163 29.1263 94.7001 26.1457 94.7001C23.1652 94.7001 20.749 97.1163 20.749 100.097C20.749 103.077 23.1652 105.494 26.1457 105.494Z" fill="currentColor"/>
          <path d="M63.157 169.405C66.1376 169.405 68.5537 166.989 68.5537 164.008C68.5537 161.027 66.1376 158.611 63.157 158.611C60.1765 158.611 57.7603 161.027 57.7603 164.008C57.7603 166.989 60.1765 169.405 63.157 169.405Z" fill="currentColor"/>
          <path d="M137.012 169.307C139.993 169.307 142.41 166.89 142.41 163.91C142.41 160.929 139.993 158.512 137.012 158.512C134.031 158.512 131.615 160.929 131.615 163.91C131.615 166.89 134.031 169.307 137.012 169.307Z" fill="currentColor"/>
          <path d="M173.853 105.297C176.834 105.297 179.25 102.881 179.25 99.9005C179.25 96.92 176.834 94.5038 173.853 94.5038C170.872 94.5038 168.456 96.92 168.456 99.9005C168.456 102.881 170.872 105.297 173.853 105.297Z" fill="currentColor"/>
          <path d="M136.842 41.3867C139.823 41.3867 142.239 38.9705 142.239 35.99C142.239 33.0095 139.823 30.5933 136.842 30.5933C133.862 30.5933 131.446 33.0095 131.446 35.99C131.446 38.9705 133.862 41.3867 136.842 41.3867Z" fill="currentColor"/>
        </g>
        <g id="avatar">
          <circle cx="256" cy="114.526" r="114.526" fill="currentColor"/>
          <path d="M256,256c-111.619,0-202.105,90.487-202.105,202.105c0,29.765,24.13,53.895,53.895,53.895h296.421 c29.765,0,53.895-24.13,53.895-53.895C458.105,346.487,367.619,256,256,256z" fill="currentColor"/>
        </g>
        <g id="card">
          <path stroke="var(--card-stroke-color, var(--nord-0))" stroke-width="var(--card-stroke-width, 2)" fill="currentColor" d="M-12 -23 L12 -23 Q18 -23 18 -17 L18 17 Q18 23 12 23 L-12 23 Q-18 23 -18 17 L-18 -17 Q-18 -23 -12 -23"/>
        </g>
        <g id="card-outline">
          <path stroke="none" fill="currentColor" d="M10 -22 Q16 -22 16 -16 L16 -12 10 -12 10 -16 4 -16 4 -22 10 -22 M16 6 L10 6 10 -6 16 -6 16 6 M16 16 Q16 22 10 22 L4 22 4 16 10 16 10 12 16 12 16 16 M-10 -22 L-4 -22 -4 -16 -10 -16 -10 -12 -16 -12 -16 -16 Q-16 -22 -10 -22 M-10 6 L-16 6 -16 -6 -10 -6 -10 6 M-10 22 Q-16 22 -16 16 L-16 12 -10 12 -10 16 -4 16 -4 22 -10 22"/>
        </g>
        <g id="link">
          <path d="M7.05025 1.53553C8.03344 0.552348 9.36692 0 10.7574 0C13.6528 0 16 2.34721 16 5.24264C16 6.63308 15.4477 7.96656 14.4645 8.94975L12.4142 11L11 9.58579L13.0503 7.53553C13.6584 6.92742 14 6.10264 14 5.24264C14 3.45178 12.5482 2 10.7574 2C9.89736 2 9.07258 2.34163 8.46447 2.94975L6.41421 5L5 3.58579L7.05025 1.53553Z" fill="currentColor"/>
          <path d="M7.53553 13.0503L9.58579 11L11 12.4142L8.94975 14.4645C7.96656 15.4477 6.63308 16 5.24264 16C2.34721 16 0 13.6528 0 10.7574C0 9.36693 0.552347 8.03344 1.53553 7.05025L3.58579 5L5 6.41421L2.94975 8.46447C2.34163 9.07258 2 9.89736 2 10.7574C2 12.5482 3.45178 14 5.24264 14C6.10264 14 6.92742 13.6584 7.53553 13.0503Z" fill="currentColor"/>
          <path d="M5.70711 11.7071L11.7071 5.70711L10.2929 4.29289L4.29289 10.2929L5.70711 11.7071Z" fill="currentColor"/>
        </g>
        <g id="crown">
          <path fill="currentColor" d="M134.594 73.375c-17.522 5.65-31.232 11.854-48.125 24.25-2.19 2.097-4.337 4.22-6.44 6.406.24.566.61 1.265 1.157 2.25 1.016 1.832 2.767 4.023 4.97 6.19-3.454 5.536-6.596 11.072-9.5 16.624-3.664-3.04-6.952-6.423-9.594-10.22-7.617 9.505-14.475 19.678-20.438 30.44.395 1.636 1.557 3.42 3.78 5.81 2.656 2.853 6.805 5.8 11.626 8.314-2.024 6.117-3.76 12.204-5.186 18.28-7.44-3.38-14.245-7.768-19.594-13.343-5.94 13.804-10.473 28.42-13.406 43.656 1.335 2.434 3.714 4.663 7.312 7.032 5.072 3.34 12.36 6.076 20.282 7.657-.045 6.437.25 12.822.812 19.124-11.407-1.673-22.405-5.248-31.375-11.156-.05-.034-.106-.06-.156-.094-1.31 15.59-.872 30.96 1.093 45.906 2.31 3.48 6.176 5.957 11.937 7.938 7.406 2.546 17.472 3.344 27.72 2.312 2 6.122 4.275 12.13 6.81 18-13.97 2.098-28.237 1.622-40.593-2.625-.337-.116-.665-.252-1-.375 3.978 15.49 9.66 30.37 16.844 44.406 3.553 2.804 8.35 4.216 14.72 4.656 9.3.644 21.144-1.73 32.438-6.343 3.712 5.257 7.63 10.34 11.75 15.25-14.57 6.715-30.36 10.675-45.063 9.75 9.952 14.602 21.638 27.964 34.844 39.75 4.26 1.446 9.3 1.465 15.374.28 9.6-1.873 20.855-7.404 31.03-15 .008.005.026-.005.032 0 5.154 3.978 10.476 7.75 15.906 11.25-11.976 9.91-25.625 17.696-39.53 21.22 11.654 7.88 24.148 14.67 37.343 20.186 4.937.423 10.29-.96 16.344-3.906 7.672-3.735 15.78-10.252 23.03-18.28 17.036 6.783 34.732 11.22 52.563 12.905l1.78-18.625c-14.268-1.35-28.584-4.77-42.562-9.938 6.883-11.108 11.61-23.173 12.94-33.437 1.178-9.114.083-16.157-3.782-21.438-8.08-1.58-15.89-3.94-23.375-7-.172 6.47-1.706 12.987-4.22 19.094-3.745 9.103-9.52 17.798-16.53 25.72-5.353-3.288-10.565-6.832-15.657-10.625 6.62-7.182 11.923-14.97 14.906-22.22 3.806-9.246 4.173-16.578.625-22.81-7.748-4.957-15.003-10.737-21.718-17.22-1.773 4.3-4.187 8.37-7.032 12.094-5.476 7.165-12.572 13.51-20.563 18.905-4.12-4.72-8.052-9.603-11.75-14.688 7.152-4.694 13.296-10.1 17.47-15.562 5.038-6.594 7.22-12.41 6.468-18.094-4.976-6.553-9.494-13.582-13.5-21-2.285 2.686-4.86 5.14-7.657 7.283-6.758 5.175-14.798 9.155-23.406 12.03-2.595-5.69-4.957-11.498-7-17.437 7.427-2.405 14.13-5.683 19.03-9.437 5.696-4.362 8.802-8.545 9.532-13.25-3.03-7.998-5.508-16.32-7.406-24.908-1.878 1.075-3.82 2.024-5.812 2.813-7.45 2.947-15.75 4.434-24.28 4.75-.662-6.16-1.027-12.403-1.033-18.72 6.957-.263 13.464-1.437 18.44-3.405 4.6-1.82 7.595-3.8 9.343-6.25-1.018-9.72-1.33-19.69-.813-29.813-.65.104-1.29.18-1.938.25-6.624.725-13.556.15-20.406-1.343 1.37-5.98 3.07-12.01 5.094-18.063 4.87.933 9.538 1.223 13.28.814 2.614-.286 4.532-.756 6-1.406 1.395-8.93 3.407-17.644 5.97-26.032-4.182-.736-8.284-2.092-12.25-3.875 2.834-5.457 5.926-10.928 9.344-16.405 2.414.963 4.716 1.665 6.687 1.97 1.107.17 2.023.265 2.782.28 1.946-4.64 4.022-9.17 6.282-13.563 5.898-11.802 12.415-24.25 17-37.937zm244.375 0c4.583 13.686 11.1 26.135 17 37.938 2.26 4.393 4.366 8.923 6.31 13.562.752-.016 1.66-.113 2.75-.28 1.98-.306 4.296-1 6.72-1.97 3.418 5.477 6.51 10.948 9.344 16.406-3.976 1.786-8.096 3.14-12.28 3.876 2.563 8.39 4.573 17.1 5.967 26.03 1.474.658 3.404 1.12 6.033 1.408 3.742.41 8.41.12 13.28-.813 2.026 6.063 3.692 12.104 5.063 18.095-6.837 1.487-13.762 2.036-20.375 1.313-.656-.072-1.308-.145-1.967-.25.517 10.124.236 20.092-.782 29.812 1.75 2.45 4.745 4.43 9.345 6.25 4.967 1.965 11.462 3.14 18.406 3.406-.006 6.316-.37 12.56-1.03 18.72-8.52-.32-16.808-1.808-24.25-4.75-1.994-.79-3.933-1.74-5.813-2.814-1.895 8.575-4.383 16.89-7.406 24.875.715 4.72 3.795 8.912 9.5 13.282 4.904 3.753 11.605 7.03 19.033 9.436-2.044 5.94-4.405 11.747-7 17.438-8.598-2.875-16.624-6.862-23.375-12.03-2.804-2.148-5.4-4.592-7.688-7.283-4.01 7.422-8.52 14.444-13.5 21-.76 5.682 1.43 11.502 6.47 18.095 4.168 5.457 10.313 10.87 17.467 15.563-3.697 5.085-7.63 9.966-11.75 14.687-7.99-5.396-15.086-11.74-20.562-18.906-2.838-3.715-5.234-7.778-7-12.064-6.71 6.478-13.976 12.236-21.72 17.188-3.547 6.233-3.18 13.565.626 22.812 2.985 7.25 8.288 15.037 14.908 22.22-5.095 3.795-10.333 7.334-15.688 10.624-7.003-7.922-12.754-16.617-16.5-25.72-2.513-6.106-4.047-12.623-4.22-19.092-7.497 3.064-15.313 5.418-23.405 7-3.873 5.28-4.96 12.324-3.78 21.437 1.327 10.264 6.08 22.33 12.967 33.438-13.974 5.168-28.293 8.587-42.562 9.937l1.75 18.625c17.84-1.687 35.546-6.116 52.594-12.906 7.25 8.028 15.358 14.545 23.03 18.28 6.056 2.947 11.408 4.33 16.345 3.906 13.2-5.517 25.684-12.302 37.342-20.187-13.896-3.52-27.562-11.293-39.53-21.19 5.442-3.504 10.74-7.293 15.906-11.28 10.18 7.604 21.456 13.126 31.062 15 6.056 1.182 11.09 1.185 15.344-.25 13.212-11.788 24.92-25.172 34.875-39.78-14.705.925-30.526-3.035-45.095-9.75 4.12-4.913 8.066-9.99 11.78-15.25 11.295 4.61 23.138 6.986 32.44 6.342 6.368-.44 11.166-1.852 14.717-4.656 7.183-14.036 12.867-28.917 16.844-44.406-.335.123-.663.26-1 .375-12.355 4.247-26.623 4.723-40.594 2.625 2.536-5.87 4.813-11.878 6.813-18 10.236 1.027 20.29.23 27.688-2.313 5.765-1.98 9.65-4.455 11.968-7.937 1.965-14.946 2.372-30.318 1.064-45.906-.043.028-.082.065-.125.094-8.97 5.908-19.97 9.483-31.376 11.156.563-6.302.856-12.687.812-19.125 7.92-1.582 15.21-4.317 20.28-7.657 3.593-2.366 5.946-4.604 7.283-7.032-2.934-15.234-7.47-29.852-13.408-43.655-5.347 5.57-12.133 9.96-19.562 13.344-1.427-6.078-3.162-12.165-5.188-18.282 4.805-2.513 8.942-5.464 11.594-8.313 2.212-2.376 3.402-4.15 3.813-5.78-5.97-10.774-12.814-20.955-20.44-30.47-2.642 3.796-5.93 7.18-9.592 10.22-2.905-5.553-6.047-11.09-9.5-16.626 2.208-2.166 3.953-4.36 4.968-6.19.538-.97.92-1.656 1.156-2.218-2.106-2.193-4.275-4.334-6.468-6.437-16.893-12.396-30.603-18.6-48.125-24.25zM152.81 134.313l24.094 129.718H341l22.906-124.5-57.937 63.5L261 135.845l-45 67.187-63.188-68.718zm27.563 148.406l3.563 19.217H334.03l3.533-19.218H180.375z"/>
        </g>
        <g id="pencil">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M485.983 10.9835C500.628 -3.66117 524.372 -3.66117 539.016 10.9835L689.016 160.983C703.661 175.628 703.661 199.372 689.016 214.017L214.017 689.016C206.984 696.049 197.446 700 187.5 700H37.5C16.7893 700 0 683.211 0 662.5V512.5C0 502.554 3.95088 493.016 10.9835 485.983L485.983 10.9835ZM75 528.033V625H171.967L471.967 325L375 228.033L75 528.033ZM428.033 175L525 271.967L609.467 187.5L512.5 90.533L428.033 175Z" fill="currentColor"/>
        </g>
      </defs>
    </svg>`,
    {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000'
      }
    }
  )
}
