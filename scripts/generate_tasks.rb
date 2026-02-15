#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"
require "optparse"
require "time"

options = { count: 6, out: nil }

OptionParser.new do |parser|
  parser.banner = "Uso: ruby scripts/generate_tasks.rb [--count N] [--out path]"
  parser.on("--count N", Integer, "Cantidad de tareas a generar (default: 6)") { |v| options[:count] = v }
  parser.on("--out FILE", String, "Archivo de salida opcional") { |v| options[:out] = v }
end.parse!

titles = [
  "Revisar bloqueos del sprint",
  "Optimizar dashboard de métricas",
  "Actualizar documentación técnica",
  "Refactorizar módulo de notificaciones",
  "Preparar demo para stakeholders",
  "Analizar incidentes de soporte",
  "Ajustar pipeline de CI",
  "Validar criterios de QA"
]

priorities = %w[Alta Media Baja]

tasks = Array.new(options[:count]) do |index|
  {
    id: index + 1,
    title: titles.sample,
    priority: priorities.sample,
    completed: [true, false].sample,
    createdAt: (Time.now - rand(1..10) * 86_400).utc.iso8601
  }
end

output = JSON.pretty_generate(tasks)

if options[:out]
  File.write(options[:out], output)
end

puts output
