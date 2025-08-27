// Wait for the DOM to be fully loaded before attaching listeners.
document.addEventListener("DOMContentLoaded", () => {
  /** Initialize progress bars on the skills page **/
  document.querySelectorAll(".progress-bar-inner").forEach((el) => {
    const progress = parseInt(el.getAttribute("data-progress"), 10) || 0;
    el.style.width = `${progress}%`;
  });

  /** Restore uploaded images from localStorage **/
  document.querySelectorAll("[data-id]").forEach((container) => {
    const id = container.getAttribute("data-id");
    if (!id) return;
    const stored = localStorage.getItem(id);
    if (stored) {
      const img =
        container.querySelector("img.project-image") ||
        container.querySelector("img.upload-preview");
      if (img) {
        img.src = stored;
      }
    }
  });

  /** Handle file uploads and save previews in localStorage **/
  document.querySelectorAll("input.upload-input").forEach((input) => {
    input.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        const container = event.target.closest("[data-id]");
        if (!container || !result) return;

        const img =
          container.querySelector("img.project-image") ||
          container.querySelector("img.upload-preview");
        if (img) {
          img.src = result;
        }

        const id = container.getAttribute("data-id");
        if (id) {
          localStorage.setItem(id, result);
        }
      };
      reader.readAsDataURL(file);
    });
  });

  /** Optional: media gallery navigation (prev/next for images/videos) **/
  document.querySelectorAll(".media-gallery").forEach((gallery) => {
    const mediaItems = gallery.querySelectorAll("img, video");
    const prevBtn = gallery.querySelector(".prev");
    const nextBtn = gallery.querySelector(".next");
    let currentIndex = 0;

    function showMedia(index) {
      mediaItems.forEach((item, i) => {
        item.classList.remove("active");
        if (item.tagName.toLowerCase() === "video") {
          item.pause();
          item.currentTime = 0;
        }
        if (i === index) {
          item.classList.add("active");
        }
      });
    }

    prevBtn?.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + mediaItems.length) % mediaItems.length;
      showMedia(currentIndex);
    });

    nextBtn?.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % mediaItems.length;
      showMedia(currentIndex);
    });

    showMedia(currentIndex); // Initial display
  });
});

// הגדר מצב PDF לפרויקט delivery
const pdfState = {
  delivery: {
    pdf: null,
    currentPage: 1,
    totalPages: 0,
  },
};

const loadPdf = async (id, url) => {
  const loadingTask = pdfjsLib.getDocument(url);
  pdfState[id].pdf = await loadingTask.promise;
  pdfState[id].totalPages = pdfState[id].pdf.numPages;
  renderPdfPage(id, pdfState[id].currentPage);
};

const renderPdfPage = async (id, pageNum) => {
  const canvas = document.getElementById(`pdf-canvas-${id}`);
  const ctx = canvas.getContext("2d");
  const page = await pdfState[id].pdf.getPage(pageNum);

  const viewport = page.getViewport({ scale: 1.5 });
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: ctx, viewport }).promise;
};

const nextPdfPage = (id) => {
  if (pdfState[id].currentPage < pdfState[id].totalPages) {
    pdfState[id].currentPage++;
    renderPdfPage(id, pdfState[id].currentPage);
  }
};

const prevPdfPage = (id) => {
  if (pdfState[id].currentPage > 1) {
    pdfState[id].currentPage--;
    renderPdfPage(id, pdfState[id].currentPage);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  loadPdf("delivery", "uploads/delivery.pdf");
});

// Mobile nav toggle
document.addEventListener("click", (e) => {
  const toggle = e.target.closest(".nav-toggle");
  if (toggle) {
    document.querySelector(".main-nav")?.classList.toggle("open");
  }
});

// Scroll reveal
const revealOnScroll = () => {
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  els.forEach((el) => io.observe(el));
};

document.addEventListener("DOMContentLoaded", revealOnScroll);

// פותח את הפרופיל מוגדל
function openProfileLightbox(src) {
  document.getElementById("profile-lightbox-img").src = src;
  document.getElementById("profile-lightbox").classList.add("active");
}

// סוגר
function closeProfileLightbox() {
  document.getElementById("profile-lightbox").classList.remove("active");
}

// הוספת קליק לתמונת הפרופיל בלבד
const profileImg = document.querySelector(".profile-photo img");
if (profileImg) {
  profileImg.style.cursor = "zoom-in";
  profileImg.addEventListener("click", () =>
    openProfileLightbox(profileImg.src)
  );
}

// סגירה בלחיצה על הרקע
document.getElementById("profile-lightbox").addEventListener("click", (e) => {
  if (e.target.id === "profile-lightbox") closeProfileLightbox();
});
