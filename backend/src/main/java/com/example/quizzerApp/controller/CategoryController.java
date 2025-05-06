package com.example.quizzerApp.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.example.quizzerApp.exception.ResourceNotFoundException;
import com.example.quizzerApp.model.Category;
import com.example.quizzerApp.repository.CategoryRepository;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.ui.Model;

@Controller
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping("/new")
    public String showAddForm(Model model) {
        model.addAttribute("category", new Category());
        return "categories/add-category";
    }

    @PostMapping
    public String addCategory(@ModelAttribute Category category) {
        categoryRepository.save(category);
        return "redirect:/categories"; // Or another page
    }

    @GetMapping
    public String listCategories(Model model) {
        List<Category> categories = categoryRepository.findAll();
        model.addAttribute("categories", categories);
        return "categories/category-list";
    }

    @PostMapping("/{id}/delete")
    public String deleteCategory(@PathVariable Long id) {
        categoryRepository.deleteById(id);
        return "redirect:/categories";
    }

    // @GetMapping("/{id}/edit")
    // public String showEditForm(@PathVariable Long id, Model model) {
    // Category category = categoryRepository.findById(id)
    // .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    // model.addAttribute("category", category);
    // return "categories/edit-category";
    // }

}
