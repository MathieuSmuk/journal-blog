import "../../styles/footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <p>© {new Date().getFullYear()} Journal Blog. Built by Mathieu.</p>
      <small>Built with React, Express & PostgreSQL</small>
    </footer>
  );
}

export default Footer;
