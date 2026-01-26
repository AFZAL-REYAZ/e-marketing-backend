export const renderEmailHTML = (blocks, email, broadcastId) => {
  let html = ``;

  for (const block of blocks) {
    switch (block.type) {
      case "header":
        html += `<h2 style="font-size:20px;">${block.text}</h2>`;
        break;

      case "text":
        html += `<p style="font-size:14px;line-height:1.6;">${block.text}</p>`;
        break;

      case "button":
        html += `
          <p>
            <a
              href="https://e-marketing-backend.onrender.com/api/track/click/${broadcastId}?url=${encodeURIComponent(
                block.url
              )}"
              target="_blank"
              rel="noopener noreferrer"
              style="
                display:inline-block;
                padding:12px 20px;
                background:#2563eb;
                color:#fff;
                text-decoration:none;
                border-radius:6px;
                font-weight:600;
              "
            >
              ${block.text}
            </a>
          </p>
        `;
        break;

      case "divider":
        html += `<hr style="margin:20px 0;" />`;
        break;
    }
  }

  // ✅ Unsubscribe
  html += `
    <hr />
    <p style="font-size:12px;color:#666;">
      If you don’t want to receive these emails,
      <a
        href="https://e-marketing-backend.onrender.com/api/unsubscribe?email=${encodeURIComponent(
          email
        )}&broadcastId=${broadcastId}"
        target="_blank"
        rel="noopener noreferrer"
      >
        Unsubscribe
      </a>
    </p>

    <!-- Open tracking pixel (BEST POSITION) -->
    <img
      src="https://e-marketing-backend.onrender.com/api/track/open/${broadcastId}?t=${Date.now()}"
      width="1"
      height="1"
      style="display:none"
    />
  `;

  return html;
};
