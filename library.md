---
layout: page
title: Library
---

Books that have shaped how I think about building software and running businesses.

<div class="book-list">
{% assign sorted_books = site.data.books | sort: 'published_date' %}
{% for book in sorted_books %}
  <div class="book-item">
    <div class="book-cover">
      <a href="{{ book.goodreads_url }}" target="_blank">
        <img src="{{ book.image }}" alt="{{ book.title }}">
      </a>
    </div>
    <div class="book-details">
      <h3><a href="{{ book.goodreads_url }}" target="_blank" class="text-stone-900 dark:text-stone-100">{{ book.title }}</a></h3>
      <p class="author text-stone-600 dark:text-stone-400">{{ book.author }} ({{ book.published_date | date: "%Y" }})</p>
      <p class="description text-stone-700 dark:text-stone-300">{{ book.description }}</p>
    </div>
  </div>
{% endfor %}
</div>