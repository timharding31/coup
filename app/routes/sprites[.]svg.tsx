import type { LoaderFunction } from '@remix-run/node'

export const loader: LoaderFunction = () => {
  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg">
      <defs>
        <g id="card-back">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M57.8775 59H60V61.1225L59.925 61.1975C59.5944 65.7083 58.2456 70.0855 55.98 74C58.2393 77.9136 59.5829 82.288 59.91 86.795L59.9925 86.8775V89.045C59.985 94.22 58.6425 99.3875 55.98 104C58.607 108.547 59.9933 113.704 60 118.955V119H57.8775L50.13 111.245C45.1438 115.772 38.7743 118.481 32.055 118.933L32.1225 119H27.8775L27.9525 118.925C21.4275 118.49 15.0375 115.925 9.8775 111.253L2.115 119H0V118.955C0.0075 113.78 1.35 108.605 4.0125 104C1.38811 99.4525 0.00443381 94.2954 0 89.045V86.8775L0.075 86.8025C0.405613 82.2917 1.75441 77.9145 4.02 74C1.75549 70.0877 0.406729 65.7132 0.075 61.205L0 61.1225V59H2.1225L2.0475 59.075C8.76586 59.5247 15.1352 62.2311 20.1225 66.755L27.885 59H30C30 64.19 28.665 69.3725 25.9875 74C28.6195 78.5607 30.0035 83.7343 30 89C30 83.81 31.335 78.6275 34.0125 74C31.3805 69.4393 29.9965 64.2657 30 59H32.1225L39.87 66.755C44.8562 62.2283 51.2257 59.5193 57.945 59.0675L57.8775 59ZM58.455 117.455C58.23 113.315 57.105 109.205 55.0875 105.455C53.9601 107.168 52.6609 108.761 51.21 110.21L58.455 117.455ZM49.065 110.18L43.9425 105.058L31.545 117.455C37.845 117.118 44.0625 114.695 49.065 110.18ZM31.7625 115.115L37.755 109.13C36.714 107.98 35.7637 106.752 34.9125 105.455C33.2905 108.46 32.2235 111.732 31.7625 115.115ZM35.76 104C36.6543 105.443 37.6759 106.804 38.8125 108.065L42.8775 104L38.8125 99.935C37.6759 101.196 36.6544 102.557 35.76 104ZM37.755 98.87C36.7141 100.02 35.7637 101.248 34.9125 102.545C33.2905 99.5404 32.2235 96.2681 31.7625 92.885L37.755 98.87ZM43.9425 102.942L49.065 97.8125C44.232 93.4502 38.0465 90.8817 31.545 90.5375L43.9425 102.942ZM45 104L50.1525 109.153C51.7088 107.598 53.0804 105.869 54.24 104C53.0803 102.131 51.7087 100.402 50.1525 98.8475L45 104ZM34.0125 104C31.7532 107.914 30.4096 112.288 30.0825 116.795L30 116.878L29.925 116.802C29.5944 112.292 28.2456 107.915 25.98 104C28.2393 100.086 29.5829 95.712 29.91 91.205L29.9925 91.1225L30.0675 91.1975C30.4004 95.7089 31.7518 100.086 34.02 104H34.0125ZM40.935 67.8125C45.768 63.4502 51.9535 60.8817 58.455 60.5375L46.0575 72.9425L40.935 67.8125ZM51.1875 78.065L47.1225 74L51.1875 69.935C52.3241 71.1964 53.3456 72.5568 54.24 74C53.3457 75.4433 52.3241 76.8037 51.1875 78.065ZM55.0875 75.4625C54.236 76.7565 53.2857 77.9826 52.245 79.13L58.2375 85.115C57.78 81.7775 56.73 78.5 55.0875 75.4625ZM58.455 87.455C51.9535 87.1108 45.768 84.5423 40.935 80.18L46.0575 75.0575L58.455 87.455ZM39.8475 68.8475L45 74L39.8475 79.1525C38.2913 77.598 36.9197 75.8691 35.76 74C36.9196 72.1309 38.2912 70.402 39.8475 68.8475ZM38.79 67.79L31.545 60.545C31.77 64.685 32.895 68.795 34.9125 72.545C36.0399 70.8322 37.3391 69.239 38.79 67.79ZM31.545 87.455C31.77 83.315 32.895 79.205 34.9125 75.455C36.0399 77.1678 37.3391 78.761 38.79 80.21L31.545 87.455ZM51.21 97.79L58.455 90.545C58.23 94.685 57.105 98.795 55.0875 102.545C53.9601 100.832 52.6609 99.239 51.21 97.79ZM57.945 88.9325L50.13 96.755C45.1438 92.2283 38.7743 89.5193 32.055 89.0675L39.87 81.245C44.8562 85.7717 51.2257 88.4807 57.945 88.9325ZM52.245 68.87C53.2859 70.0198 54.2363 71.2485 55.0875 72.545C56.7094 69.5404 57.7765 66.2681 58.2375 62.885L52.245 68.87ZM28.455 90.545C22.155 90.8825 15.9375 93.305 10.935 97.82L16.0575 102.942L28.455 90.545ZM17.1225 104L21.1875 108.065C22.3425 106.79 23.3625 105.425 24.24 104C23.3456 102.557 22.3241 101.196 21.1875 99.935L17.1225 104ZM16.0575 105.058L10.935 110.188C15.768 114.55 21.9535 117.118 28.455 117.462L16.0575 105.058ZM28.2375 115.115L22.245 109.13C23.286 107.98 24.2363 106.752 25.0875 105.455C26.7095 108.46 27.7765 111.732 28.2375 115.115ZM15 104L9.8475 98.8475C8.29128 100.402 6.9197 102.131 5.76 104C6.9197 105.869 8.29128 107.598 9.8475 109.153L15 104ZM27.945 89.075L20.13 81.2375C15.1438 85.7642 8.77429 88.4732 2.055 88.925L9.87 96.7475C14.8562 92.2208 21.2257 89.5118 27.945 89.06V89.075ZM8.79 97.79C7.33949 99.2366 6.04027 100.827 4.9125 102.537C2.8875 98.7875 1.7625 94.685 1.5375 90.5375L8.79 97.79ZM4.9125 105.463C2.8875 109.213 1.7625 113.315 1.5375 117.462L8.79 110.21C7.33949 108.763 6.04027 107.173 4.9125 105.463ZM28.2375 92.885C27.78 96.2225 26.73 99.5 25.0875 102.537C24.236 101.244 23.2856 100.017 22.245 98.87L28.2375 92.885ZM25.0875 75.4625C27.1125 79.2125 28.2375 83.315 28.4625 87.4625L21.21 80.21C22.6875 78.7325 23.985 77.135 25.0875 75.4625ZM13.9425 75.0575L19.065 80.1875C14.232 84.5498 8.04646 87.1183 1.545 87.4625L13.9425 75.0575ZM7.755 79.13L1.7625 85.115C2.22 81.7775 3.27 78.5 4.9125 75.4625C5.76399 76.7565 6.71433 77.9826 7.755 79.13ZM8.8125 78.065C7.67591 76.8037 6.65435 75.4432 5.76 74C6.65438 72.5568 7.67595 71.1964 8.8125 69.935L12.8775 74L8.8125 78.065ZM4.9125 72.5375C5.76399 71.2435 6.71433 70.0174 7.755 68.87L1.7625 62.885C2.22 66.2225 3.27 69.5 4.9125 72.5375ZM1.545 60.545C8.04646 60.8892 14.232 63.4577 19.065 67.82L13.9425 72.9425L1.545 60.545ZM20.1525 79.1525L15 74L20.1525 68.8475C21.7088 70.402 23.0804 72.1309 24.24 74C23.0804 75.8691 21.7088 77.598 20.1525 79.1525ZM25.0875 72.5375C23.9597 70.8273 22.6605 69.2366 21.21 67.79L28.455 60.545C28.23 64.685 27.105 68.795 25.0875 72.545V72.5375Z" fill="currentColor"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M57.8775 119H60V121.122L59.925 121.198C59.5944 125.708 58.2456 130.085 55.98 134C58.2393 137.914 59.5829 142.288 59.91 146.795L59.9925 146.878V149.045C59.985 154.22 58.6425 159.387 55.98 164C58.607 168.547 59.9933 173.704 60 178.955V179H57.8775L50.13 171.245C45.1438 175.772 38.7743 178.481 32.055 178.932L32.1225 179H27.8775L27.9525 178.925C21.4275 178.49 15.0375 175.925 9.8775 171.253L2.115 179H0V178.955C0.0075 173.78 1.35 168.605 4.0125 164C1.38811 159.453 0.00443381 154.295 0 149.045V146.878L0.075 146.803C0.405613 142.292 1.75441 137.915 4.02 134C1.75549 130.088 0.406729 125.713 0.075 121.205L0 121.122V119H2.1225L2.0475 119.075C8.76586 119.525 15.1352 122.231 20.1225 126.755L27.885 119H30C30 124.19 28.665 129.372 25.9875 134C28.6195 138.561 30.0035 143.734 30 149C30 143.81 31.335 138.628 34.0125 134C31.3805 129.439 29.9965 124.266 30 119H32.1225L39.87 126.755C44.8562 122.228 51.2257 119.519 57.945 119.067L57.8775 119ZM58.455 177.455C58.23 173.315 57.105 169.205 55.0875 165.455C53.9601 167.168 52.6609 168.761 51.21 170.21L58.455 177.455ZM49.065 170.18L43.9425 165.057L31.545 177.455C37.845 177.118 44.0625 174.695 49.065 170.18ZM31.7625 175.115L37.755 169.13C36.714 167.98 35.7637 166.752 34.9125 165.455C33.2905 168.46 32.2235 171.732 31.7625 175.115ZM35.76 164C36.6543 165.443 37.6759 166.804 38.8125 168.065L42.8775 164L38.8125 159.935C37.6759 161.196 36.6544 162.557 35.76 164ZM37.755 158.87C36.7141 160.02 35.7637 161.248 34.9125 162.545C33.2905 159.54 32.2235 156.268 31.7625 152.885L37.755 158.87ZM43.9425 162.943L49.065 157.812C44.232 153.45 38.0465 150.882 31.545 150.538L43.9425 162.943ZM45 164L50.1525 169.152C51.7088 167.598 53.0804 165.869 54.24 164C53.0803 162.131 51.7087 160.402 50.1525 158.848L45 164ZM34.0125 164C31.7532 167.914 30.4096 172.288 30.0825 176.795L30 176.878L29.925 176.803C29.5944 172.292 28.2456 167.915 25.98 164C28.2393 160.086 29.5829 155.712 29.91 151.205L29.9925 151.122L30.0675 151.197C30.4004 155.709 31.7518 160.086 34.02 164H34.0125ZM40.935 127.812C45.768 123.45 51.9535 120.882 58.455 120.537L46.0575 132.943L40.935 127.812ZM51.1875 138.065L47.1225 134L51.1875 129.935C52.3241 131.196 53.3456 132.557 54.24 134C53.3457 135.443 52.3241 136.804 51.1875 138.065ZM55.0875 135.462C54.236 136.756 53.2857 137.983 52.245 139.13L58.2375 145.115C57.78 141.778 56.73 138.5 55.0875 135.462ZM58.455 147.455C51.9535 147.111 45.768 144.542 40.935 140.18L46.0575 135.057L58.455 147.455ZM39.8475 128.848L45 134L39.8475 139.152C38.2913 137.598 36.9197 135.869 35.76 134C36.9196 132.131 38.2912 130.402 39.8475 128.848ZM38.79 127.79L31.545 120.545C31.77 124.685 32.895 128.795 34.9125 132.545C36.0399 130.832 37.3391 129.239 38.79 127.79ZM31.545 147.455C31.77 143.315 32.895 139.205 34.9125 135.455C36.0399 137.168 37.3391 138.761 38.79 140.21L31.545 147.455ZM51.21 157.79L58.455 150.545C58.23 154.685 57.105 158.795 55.0875 162.545C53.9601 160.832 52.6609 159.239 51.21 157.79ZM57.945 148.932L50.13 156.755C45.1438 152.228 38.7743 149.519 32.055 149.068L39.87 141.245C44.8562 145.772 51.2257 148.481 57.945 148.932ZM52.245 128.87C53.2859 130.02 54.2363 131.248 55.0875 132.545C56.7094 129.54 57.7765 126.268 58.2375 122.885L52.245 128.87ZM28.455 150.545C22.155 150.882 15.9375 153.305 10.935 157.82L16.0575 162.943L28.455 150.545ZM17.1225 164L21.1875 168.065C22.3425 166.79 23.3625 165.425 24.24 164C23.3456 162.557 22.3241 161.196 21.1875 159.935L17.1225 164ZM16.0575 165.057L10.935 170.188C15.768 174.55 21.9535 177.118 28.455 177.462L16.0575 165.057ZM28.2375 175.115L22.245 169.13C23.286 167.98 24.2363 166.752 25.0875 165.455C26.7095 168.46 27.7765 171.732 28.2375 175.115ZM15 164L9.8475 158.848C8.29128 160.402 6.9197 162.131 5.76 164C6.9197 165.869 8.29128 167.598 9.8475 169.152L15 164ZM27.945 149.075L20.13 141.238C15.1438 145.764 8.77429 148.473 2.055 148.925L9.87 156.747C14.8562 152.221 21.2257 149.512 27.945 149.06V149.075ZM8.79 157.79C7.33949 159.237 6.04027 160.827 4.9125 162.538C2.8875 158.788 1.7625 154.685 1.5375 150.538L8.79 157.79ZM4.9125 165.462C2.8875 169.212 1.7625 173.315 1.5375 177.462L8.79 170.21C7.33949 168.763 6.04027 167.173 4.9125 165.462ZM28.2375 152.885C27.78 156.222 26.73 159.5 25.0875 162.538C24.236 161.244 23.2856 160.017 22.245 158.87L28.2375 152.885ZM25.0875 135.462C27.1125 139.212 28.2375 143.315 28.4625 147.462L21.21 140.21C22.6875 138.733 23.985 137.135 25.0875 135.462ZM13.9425 135.057L19.065 140.188C14.232 144.55 8.04646 147.118 1.545 147.462L13.9425 135.057ZM7.755 139.13L1.7625 145.115C2.22 141.778 3.27 138.5 4.9125 135.462C5.76399 136.756 6.71433 137.983 7.755 139.13ZM8.8125 138.065C7.67591 136.804 6.65435 135.443 5.76 134C6.65438 132.557 7.67595 131.196 8.8125 129.935L12.8775 134L8.8125 138.065ZM4.9125 132.538C5.76399 131.244 6.71433 130.017 7.755 128.87L1.7625 122.885C2.22 126.223 3.27 129.5 4.9125 132.538ZM1.545 120.545C8.04646 120.889 14.232 123.458 19.065 127.82L13.9425 132.943L1.545 120.545ZM20.1525 139.152L15 134L20.1525 128.848C21.7088 130.402 23.0804 132.131 24.24 134C23.0804 135.869 21.7088 137.598 20.1525 139.152ZM25.0875 132.538C23.9597 130.827 22.6605 129.237 21.21 127.79L28.455 120.545C28.23 124.685 27.105 128.795 25.0875 132.545V132.538Z" fill="currentColor"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M57.8775 0H60V2.1225L59.925 2.1975C59.5944 6.70829 58.2456 11.0855 55.98 15C58.2393 18.9136 59.5829 23.288 59.91 27.795L59.9925 27.8775V30.045C59.985 35.22 58.6425 40.3875 55.98 45C58.607 49.5467 59.9933 54.7039 60 59.955V60H57.8775L50.13 52.245C45.1438 56.7717 38.7743 59.4807 32.055 59.9325L32.1225 60H27.8775L27.9525 59.925C21.4275 59.49 15.0375 56.925 9.8775 52.2525L2.115 60H0V59.955C0.0075 54.78 1.35 49.605 4.0125 45C1.38811 40.4525 0.00443381 35.2954 0 30.045V27.8775L0.075 27.8025C0.405613 23.2917 1.75441 18.9145 4.02 15C1.75549 11.0877 0.406729 6.71322 0.075 2.205L0 2.1225V0H2.1225L2.0475 0.075C8.76586 0.524743 15.1352 3.23107 20.1225 7.755L27.885 0H30C30 5.19 28.665 10.3725 25.9875 15C28.6195 19.5607 30.0035 24.7343 30 30C30 24.81 31.335 19.6275 34.0125 15C31.3805 10.4393 29.9965 5.26567 30 0H32.1225L39.87 7.755C44.8562 3.22834 51.2257 0.519326 57.945 0.0675L57.8775 0ZM58.455 58.455C58.23 54.315 57.105 50.205 55.0875 46.455C53.9601 48.1678 52.6609 49.761 51.21 51.21L58.455 58.455ZM49.065 51.18L43.9425 46.0575L31.545 58.455C37.845 58.1175 44.0625 55.695 49.065 51.18ZM31.7625 56.115L37.755 50.13C36.714 48.9802 35.7637 47.7515 34.9125 46.455C33.2905 49.4595 32.2235 52.7319 31.7625 56.115ZM35.76 45C36.6543 46.4433 37.6759 47.8037 38.8125 49.065L42.8775 45L38.8125 40.935C37.6759 42.1964 36.6544 43.5568 35.76 45ZM37.755 39.87C36.7141 41.0198 35.7637 42.2485 34.9125 43.545C33.2905 40.5405 32.2235 37.2681 31.7625 33.885L37.755 39.87ZM43.9425 43.9425L49.065 38.8125C44.232 34.4502 38.0465 31.8817 31.545 31.5375L43.9425 43.9425ZM45 45L50.1525 50.1525C51.7088 48.598 53.0804 46.8691 54.24 45C53.0803 43.1309 51.7087 41.402 50.1525 39.8475L45 45ZM34.0125 45C31.7532 48.9136 30.4096 53.288 30.0825 57.795L30 57.8775L29.925 57.8025C29.5944 53.2917 28.2456 48.9145 25.98 45C28.2393 41.0864 29.5829 36.712 29.91 32.205L29.9925 32.1225L30.0675 32.1975C30.4004 36.7089 31.7518 41.0861 34.02 45H34.0125ZM40.935 8.8125C45.768 4.45018 51.9535 1.88168 58.455 1.5375L46.0575 13.9425L40.935 8.8125ZM51.1875 19.065L47.1225 15L51.1875 10.935C52.3241 12.1964 53.3456 13.5568 54.24 15C53.3457 16.4433 52.3241 17.8037 51.1875 19.065ZM55.0875 16.4625C54.236 17.7565 53.2857 18.9826 52.245 20.13L58.2375 26.115C57.78 22.7775 56.73 19.5 55.0875 16.4625ZM58.455 28.455C51.9535 28.1108 45.768 25.5423 40.935 21.18L46.0575 16.0575L58.455 28.455ZM39.8475 9.8475L45 15L39.8475 20.1525C38.2913 18.598 36.9197 16.8691 35.76 15C36.9196 13.1309 38.2912 11.402 39.8475 9.8475ZM38.79 8.79L31.545 1.545C31.77 5.685 32.895 9.795 34.9125 13.545C36.0399 11.8322 37.3391 10.239 38.79 8.79ZM31.545 28.455C31.77 24.315 32.895 20.205 34.9125 16.455C36.0399 18.1678 37.3391 19.761 38.79 21.21L31.545 28.455ZM51.21 38.79L58.455 31.545C58.23 35.685 57.105 39.795 55.0875 43.545C53.9601 41.8322 52.6609 40.239 51.21 38.79ZM57.945 29.9325L50.13 37.755C45.1438 33.2283 38.7743 30.5193 32.055 30.0675L39.87 22.245C44.8562 26.7717 51.2257 29.4807 57.945 29.9325ZM52.245 9.87C53.2859 11.0198 54.2363 12.2485 55.0875 13.545C56.7094 10.5404 57.7765 7.26813 58.2375 3.885L52.245 9.87ZM28.455 31.545C22.155 31.8825 15.9375 34.305 10.935 38.82L16.0575 43.9425L28.455 31.545ZM17.1225 45L21.1875 49.065C22.3425 47.79 23.3625 46.425 24.24 45C23.3456 43.5568 22.3241 42.1964 21.1875 40.935L17.1225 45ZM16.0575 46.0575L10.935 51.1875C15.768 55.5498 21.9535 58.1183 28.455 58.4625L16.0575 46.0575ZM28.2375 56.115L22.245 50.13C23.286 48.9802 24.2363 47.7515 25.0875 46.455C26.7095 49.4595 27.7765 52.7319 28.2375 56.115ZM15 45L9.8475 39.8475C8.29128 41.402 6.9197 43.1309 5.76 45C6.9197 46.8691 8.29128 48.598 9.8475 50.1525L15 45ZM27.945 30.075L20.13 22.2375C15.1438 26.7642 8.77429 29.4732 2.055 29.925L9.87 37.7475C14.8562 33.2208 21.2257 30.5118 27.945 30.06V30.075ZM8.79 38.79C7.33949 40.2366 6.04027 41.8273 4.9125 43.5375C2.8875 39.7875 1.7625 35.685 1.5375 31.5375L8.79 38.79ZM4.9125 46.4625C2.8875 50.2125 1.7625 54.315 1.5375 58.4625L8.79 51.21C7.33949 49.7634 6.04027 48.1727 4.9125 46.4625ZM28.2375 33.885C27.78 37.2225 26.73 40.5 25.0875 43.5375C24.236 42.2436 23.2856 41.0174 22.245 39.87L28.2375 33.885ZM25.0875 16.4625C27.1125 20.2125 28.2375 24.315 28.4625 28.4625L21.21 21.21C22.6875 19.7325 23.985 18.135 25.0875 16.4625ZM13.9425 16.0575L19.065 21.1875C14.232 25.5498 8.04646 28.1183 1.545 28.4625L13.9425 16.0575ZM7.755 20.13L1.7625 26.115C2.22 22.7775 3.27 19.5 4.9125 16.4625C5.76399 17.7565 6.71433 18.9826 7.755 20.13ZM8.8125 19.065C7.67591 17.8037 6.65435 16.4432 5.76 15C6.65438 13.5568 7.67595 12.1964 8.8125 10.935L12.8775 15L8.8125 19.065ZM4.9125 13.5375C5.76399 12.2435 6.71433 11.0174 7.755 9.87L1.7625 3.885C2.22 7.2225 3.27 10.5 4.9125 13.5375ZM1.545 1.545C8.04646 1.88918 14.232 4.45768 19.065 8.82L13.9425 13.9425L1.545 1.545ZM20.1525 20.1525L15 15L20.1525 9.8475C21.7088 11.402 23.0804 13.1309 24.24 15C23.0804 16.8691 21.7088 18.598 20.1525 20.1525ZM25.0875 13.5375C23.9597 11.8273 22.6605 10.2366 21.21 8.79L28.455 1.545C28.23 5.685 27.105 9.795 25.0875 13.545V13.5375Z" fill="currentColor"/>
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
          <path stroke="none" fill="currentColor" d="M9.8 -25.45 Q11.2 -24.65 10.95 -21.75 L10.95 -21.7 Q9.9 -14.95 6.15 -13.85 3.6 -12.75 0.1 -13.05 L-0.1 -13.05 Q-3.6 -12.75 -6.2 -13.85 -9.9 -14.95 -10.95 -21.7 L-10.95 -21.75 Q-11.2 -24.65 -9.8 -25.45 L-5.9 -25.35 -5.95 -25.35 Q-2.8 -24 0 -24 2.8 -24 5.9 -25.35 L9.8 -25.45 M26.5 -8.8 Q27.15 -7.75 26.9 -6.5 26.6 -5.3 25.55 -4.65 L24.65 -4.25 26.7 -0.25 Q27.2 0.95 26.75 2.1 26.25 3.25 25.1 3.75 L22.75 3.8 Q21.6 3.3 21.1 2.2 17.85 -5.2 11.2 -10.5 10.4 -11.1 10.15 -12 9.85 -12.9 10.15 -13.75 10.4 -14.65 11.2 -15.25 11.9 -15.9 12.8 -15.95 21.6 -16.7 26.5 -8.8 M0 26 Q-17.15 25.8 -18.8 16 -9.7 19.8 -2.55 16.3 L-2.65 16.4 Q0 15.25 1.05 12.65 L1.15 12.65 Q2.15 9.9 1.05 7.25 L1.05 7.2 Q-0.05 4.6 -2.7 3.4 -5.35 2.35 -7.9 3.35 -10.8 4.1 -14.6 2.45 -14.25 1.1 -14.75 -0.35 L-15.3 -1.65 Q-13.35 -5.95 -10.5 -8.6 -8.6 -10.6 -5.3 -9.7 -2.6 -8.7 -0.15 -8.7 2.6 -8.7 5.35 -9.7 8.65 -10.6 10.55 -8.6 17.15 -2.4 18.95 12.85 19.75 25.75 0 26 M-20 -1.1 L-18.5 -0.95 Q-17.75 -0.55 -17.5 0.25 -17.3 1 -17.7 1.75 -18.1 2.5 -18.85 2.75 L-19.5 2.95 -17.35 4.2 Q-11.25 7.45 -6.85 5.95 -5.3 5.3 -3.75 5.95 -2.25 6.6 -1.6 8.15 -0.95 9.65 -1.6 11.2 -2.25 12.7 -3.75 13.35 -10.3 16.45 -18.9 12.45 L-21.25 11.25 Q-20.95 12 -21.25 12.75 -21.55 13.5 -22.3 13.85 -23.1 14.15 -23.85 13.85 -24.6 13.55 -24.95 12.8 L-27.35 7.05 Q-28.05 6.2 -28.2 5.1 L-28.2 5 -28.7 3.85 -28.8 2.75 Q-28.75 2.15 -28.35 1.75 L-27.4 1.15 -20 -1.1"/>
        </g>
        <g id="lock">
          <path stroke="none" fill="currentColor" d="M-8 -10 L-8 -6 8 -6 8 -10 Q8 -13.3 5.65 -15.65 3.3 -18 0 -18 -3.3 -18 -5.65 -15.7 L-5.7 -15.65 Q-8 -13.3 -8 -10 M16 -6 Q20 -6 20 -2 L20 22 Q20 23.95 19.05 24.95 18.05 26 16 26 L-16 26 Q-18.05 26 -19.05 24.95 -20 23.95 -20 22 L-20 -2 Q-20 -6 -16 -6 L-16 -10 Q-16 -16.6 -11.35 -21.3 L-11.3 -21.35 Q-6.6 -26 0 -26 6.6 -26 11.3 -21.3 16 -16.6 16 -10 L16 -6 M0 2 Q-2.05 2 -3.5 3.45 L-3.55 3.5 Q-5 4.95 -5 7 -5 9.05 -3.55 10.5 L-2.45 11.35 -2.1 11.75 -2 12.2 -2 15.75 Q-2 16.55 -1.4 17.15 -0.8 17.75 0 17.75 0.8 17.75 1.4 17.15 2 16.55 2 15.75 L2 12.2 2.15 11.75 2.5 11.35 3.5 10.55 3.55 10.5 Q5 9.05 5 7 5 4.95 3.5 3.45 2.05 2 0 2"/>
        </g>
        <g id="challenge">
          <path stroke="none" fill="currentColor" d="M-12.5 -26 L-8.65 -25 Q-7.8 -24.75 -7.4 -24 -7 -23.35 -7.25 -22.5 L-7.65 -20.85 Q2.2 -23.9 8.65 -14.05 14.3 -5.55 23.45 -10.1 L24.95 -10.25 Q25.75 -10 26.15 -9.25 26.5 -8.55 26.3 -7.8 L20.05 15.4 19.7 16.15 19.1 16.7 Q6.7 22.85 -0.85 11.35 -6.4 3 -15.15 7.1 L-19.65 23.85 Q-19.85 24.65 -20.6 25.1 L-22.1 25.25 -25.95 24.25 Q-26.8 24 -27.2 23.3 -27.6 22.55 -27.4 21.75 L-15 -24.6 Q-14.75 -25.45 -14 -25.8 L-12.5 -26"/>
        </g>
        <g id="exchange">
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

/**
    <pattern id="card-back" patternUnits="objectBoundingBox" width="1" height="0.75" viewBox="0 0 80 80">
        <pattern id="card-back" patternUnits="objectBoundingBox" width="0.5" height="0.375" viewBox="0 0 80 80">
 */
// ;<svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
// <g clip-path="url(#clip0_4_45)">

// </g>
// <defs>
// <clipPath id="clip0_4_45">
// <rect width="60" height="80" fill="white"/>
// </clipPath>
// </defs>
// </svg>
