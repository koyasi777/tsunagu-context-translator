// worker.js
export default {
  async fetch(request) {
    return new Response('Cloudflare Worker is running!', {
      headers: { 'content-type': 'text/plain' },
    });
  },
};
